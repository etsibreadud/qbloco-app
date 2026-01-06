import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Block } from "./components/BlockCard";
import { BlockDetail } from "./components/BlockDetail";
import { AppShell } from "./components/navigation/AppShell";
import { BottomNav, type NavKey } from "./components/navigation/BottomNav";
import { HomePage } from "./pages/HomePage";
import { SchedulePage } from "./pages/SchedulePage";
import { ProfilePage, type UserStats } from "./pages/ProfilePage";
import type { Filters } from "./components/FilterPanel";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "./components/ui/drawer";
import { toast } from "sonner";
import { useGeoTracker } from "./hooks/useGeoTracker";
import { formatDistance } from "./lib/distance";
import { supabase, hasSupabaseConfig } from "./lib/supabaseClient";
import { sampleBlocks } from "./data/sampleBlocks";

type ActiveVisit = {
  sessionId: string;
  blockId: string;
  blockName: string;
  blockDate: string;
  checkInAt: string;
};

const emptyStats: UserStats = {
  totalDistanceMeters: 0,
  totalVisits: 0,
  visits: [],
  badges: [],
};

function calculateBadges(stats: UserStats): string[] {
  const b: string[] = [];
  if ((stats.totalVisits || 0) >= 1) b.push("Primeiro bloco");
  if ((stats.totalVisits || 0) >= 3) b.push("Três blocos");
  if ((stats.totalVisits || 0) >= 5) b.push("Cinco blocos");

  const km = (stats.totalDistanceMeters || 0) / 1000;
  if (km >= 1) b.push("1 km");
  if (km >= 5) b.push("5 km");
  if (km >= 10) b.push("10 km");

  return Array.from(new Set(b));
}

type DbBlock = {
  id: string;
  name: string;
  date: string;
  time: string;
  neighborhood: string;
  metro: string;
  audience: string[] | null;
  expected_crowd: "low" | "medium" | "high" | "very-high" | null;
  rating: number | null;
  review_count?: number | null;
  observations?: string | null;
  source?: string | null;
  tags?: string[] | null;
};

type DbSession = {
  id: string;
  user_id: string;
  bloco_id: string;
  started_at: string;
  ended_at: string | null;
  distance_m: number | null;
};

export default function App() {
  const [nav, setNav] = useState<NavKey>("home");
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const userEmail = session?.user?.email ?? null;
  const userId = session?.user?.id ?? null;
  const adminEmails = useMemo(
    () =>
      (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
        ?.split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean) || [],
    [],
  );
  const isAdmin = !!(userEmail && adminEmails.includes(userEmail.toLowerCase()));

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isBlocksLoading, setIsBlocksLoading] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>(emptyStats);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    dateStart: "",
    dateEnd: "",
    timeOfDay: [],
    audiences: [],
    neighborhood: "",
    metro: "",
    crowd: "",
    favoritesOnly: false,
    sortBy: "date",
  });

  const [activeVisit, setActiveVisit] = useState<ActiveVisit | null>(null);

  const geo = useGeoTracker();
  const liveDistance = useMemo(() => geo.distanceMeters, [geo.distanceMeters]);

  useEffect(() => {
    let mounted = true;

    if (!hasSupabaseConfig) {
      setSession(null);
      return () => {
        mounted = false;
      };
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        toast.error("Falha ao obter sessão. Verifique sua configuração do Supabase.");
        return;
      }
      setSession(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const requestMagicLink = async (email: string) => {
    if (!hasSupabaseConfig) {
      toast.error("Defina as chaves do Supabase para enviar o link de acesso.");
      return;
    }
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      toast.error(error.message || "Não foi possível enviar o link de acesso.");
      return;
    }

    toast.message("Link enviado. Abra seu e-mail para concluir o login.", { duration: 3500 });
  };

  const logout = async () => {
    geo.stop();
    setActiveVisit(null);

    if (!hasSupabaseConfig) {
      setSession(null);
      setFavoriteIds([]);
      setStats(emptyStats);
      toast.message("Sessão local encerrada.");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Não foi possível sair.");
      return;
    }

    setFavoriteIds([]);
    setStats(emptyStats);
    toast.message("Você saiu da sua conta.");
  };

  const mapDbBlock = (b: DbBlock): Block => ({
    id: b.id,
    name: b.name,
    date: b.date,
    time: b.time,
    neighborhood: b.neighborhood,
    metro: b.metro,
    audiences: b.audience ?? [],
    expectedCrowd: b.expected_crowd ?? "medium",
    rating: typeof b.rating === "number" ? b.rating : 0,
    reviewCount: typeof b.review_count === "number" ? b.review_count : 0,
    observations: b.observations ?? undefined,
    source: b.source ?? undefined,
    tags: b.tags ?? [],
  });

  const loadBlocks = async () => {
    setIsBlocksLoading(true);
    if (!hasSupabaseConfig) {
      setBlocks(sampleBlocks);
      setIsBlocksLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("blocos")
      .select("id,name,date,time,neighborhood,metro,audience,expected_crowd,rating,review_count,observations,source,tags")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      toast.error("Falha ao carregar blocos. Verifique a tabela 'blocos' no Supabase.");
      setBlocks(sampleBlocks);
      setIsBlocksLoading(false);
      return;
    }

    setBlocks((data as DbBlock[]).map(mapDbBlock));
    setIsBlocksLoading(false);
  };

  const loadFavorites = async (uid: string) => {
    if (!hasSupabaseConfig) {
      setFavoriteIds([]);
      return;
    }
    const { data, error } = await supabase.from("favorites").select("bloco_id").eq("user_id", uid);

    if (error) {
      toast.error("Falha ao carregar favoritos.");
      setFavoriteIds([]);
      return;
    }

    setFavoriteIds((data || []).map((r: any) => r.bloco_id));
  };

  const loadStats = async (uid: string) => {
    if (!hasSupabaseConfig) {
      setStats(emptyStats);
      return;
    }
    const { data, error } = await supabase
      .from("checkin_sessions")
      .select("id, bloco_id, started_at, ended_at, distance_m, blocos:bloco_id (name,date)")
      .eq("user_id", uid)
      .order("started_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Falha ao carregar histórico.");
      setStats(emptyStats);
      return;
    }

    const sessions = (data || []) as any[];

    const completed = sessions.filter((s) => !!s.ended_at);
    const totalDistanceMeters = completed.reduce((acc, s) => acc + (Number(s.distance_m) || 0), 0);
    const totalVisits = completed.length;

    const visits = completed.map((s) => ({
      id: s.id,
      blockName: s.blocos?.name ?? "Bloco",
      blockDate: s.blocos?.date ?? "",
      checkInAt: s.started_at,
      checkOutAt: s.ended_at,
      distanceMeters: Number(s.distance_m) || 0,
    }));

    const next: UserStats = {
      totalDistanceMeters,
      totalVisits,
      visits,
      badges: [],
    };
    next.badges = calculateBadges(next);
    setStats(next);
  };

  useEffect(() => {
    loadBlocks().catch(() => {
      toast.error("Falha ao carregar blocos.");
      setIsBlocksLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    loadFavorites(userId).catch(() => setFavoriteIds([]));
    loadStats(userId).catch(() => setStats(emptyStats));
  }, [userId]);

  const toggleFavorite = async (blockId: string) => {
    if (!userId) {
      toast.message("Faça login para salvar favoritos.", { duration: 2500 });
      setNav("profile");
      return;
    }

    if (!hasSupabaseConfig) {
      toast.error("Configure o Supabase para salvar favoritos na nuvem.");
      return;
    }

    const isFav = favoriteIds.includes(blockId);

    if (isFav) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("bloco_id", blockId);
      if (error) {
        toast.error("Não foi possível remover dos favoritos.");
        return;
      }
      setFavoriteIds((prev) => prev.filter((id) => id !== blockId));
      toast.message("Removido dos favoritos.");
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: userId, bloco_id: blockId });
      if (error) {
        toast.error("Não foi possível salvar nos favoritos.");
        return;
      }
      setFavoriteIds((prev) => Array.from(new Set([...prev, blockId])));
      toast.success("Adicionado aos favoritos.");
    }
  };

  const requestLogin = () => {
    setSelectedBlock(null);
    setNav("profile");
    toast.message("Faça login para ativar check-in e salvar sua trilha.", { duration: 2500 });
  };

  const startCheckIn = async (block: Block) => {
    if (!userId) {
      requestLogin();
      return;
    }

    if (!hasSupabaseConfig) {
      toast.error("Configure o Supabase para registrar check-ins.");
      return;
    }

    if (activeVisit) {
      toast.message("Você já está em um bloco. Faça check-out antes.");
      return;
    }

    const checkInAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("checkin_sessions")
      .insert({
        user_id: userId,
        bloco_id: block.id,
        started_at: checkInAt,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Não foi possível registrar o check-in.");
      return;
    }

    setActiveVisit({
      sessionId: data.id,
      blockId: block.id,
      blockName: block.name,
      blockDate: block.date,
      checkInAt,
    });

    await geo.start();

    if (geo.state === "error") {
      toast.error(geo.error || "Não foi possível iniciar a localização.");
    } else {
      toast.success("Check-in feito. Caminhada iniciada.");
    }
  };

  const finishCheckOut = async () => {
    if (!userId) {
      requestLogin();
      return;
    }
    if (!activeVisit) return;

    if (!hasSupabaseConfig) {
      toast.error("Configure o Supabase para registrar check-outs.");
      return;
    }

    geo.stop();

    const distanceMeters = Math.round(liveDistance || 0);
    const checkOutAt = new Date().toISOString();

    const { error } = await supabase
      .from("checkin_sessions")
      .update({
        ended_at: checkOutAt,
        distance_m: distanceMeters,
        status: "completed",
      })
      .eq("id", activeVisit.sessionId)
      .eq("user_id", userId);

    if (error) {
      toast.error("Não foi possível finalizar o check-out.");
      return;
    }

    setActiveVisit(null);
    toast.success(`Check-out feito. Você caminhou ${formatDistance(distanceMeters)}.`);

    await loadStats(userId);
  };

  const favorites = useMemo(() => {
    const set = new Set(favoriteIds);
    return blocks.filter((b) => set.has(b.id));
  }, [blocks, favoriteIds]);

  const page = useMemo(() => {
    if (nav === "home") {
      return <HomePage onGoSchedule={() => setNav("schedule")} isLoggedIn={!!userEmail} />;
    }

    if (nav === "schedule") {
      return (
        <SchedulePage
          blocks={blocks}
          filters={filters}
          onFiltersChange={setFilters}
          onSelectBlock={(b) => setSelectedBlock(b)}
          favoriteIds={favoriteIds}
          onToggleFavorite={(id) => void toggleFavorite(id)}
        />
      );
    }

    return (
      <ProfilePage
        userEmail={userEmail}
        onRequestMagicLink={requestMagicLink}
        onLogout={logout}
        stats={stats}
        favorites={favorites}
        activeVisit={activeVisit ? { blockName: activeVisit.blockName, blockDate: activeVisit.blockDate, checkInAt: activeVisit.checkInAt } : null}
        activeDistance={liveDistance}
        isAdmin={isAdmin}
        adminBlocks={blocks}
        onRefreshBlocks={() => void loadBlocks()}
      />
    );
  }, [nav, userEmail, blocks, filters, favoriteIds, stats, favorites, activeVisit, liveDistance, isAdmin]);

  return (
    <>
      <AppShell>
        {isBlocksLoading ? (
          <div className="pb-24">
            <div className="px-4 pt-4 text-gray-600">Carregando programação…</div>
          </div>
        ) : (
          page
        )}
      </AppShell>

      <Drawer open={!!selectedBlock} onOpenChange={(o) => (!o ? setSelectedBlock(null) : null)}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader>
            <DrawerTitle>Detalhes do bloco</DrawerTitle>
            <DrawerDescription>Veja informações e faça check-in/check-out.</DrawerDescription>
          </DrawerHeader>

          {selectedBlock ? (
            <div className="px-4 pb-6">
              <BlockDetail
                block={selectedBlock}
                isLoggedIn={!!userEmail}
                onRequestLogin={requestLogin}
                onCheckIn={() => void startCheckIn(selectedBlock)}
                onCheckOut={() => void finishCheckOut()}
                isTracking={geo.state === "tracking" && !!activeVisit}
                liveDistanceLabel={geo.state === "tracking" ? formatDistance(liveDistance) : ""}
                geoError={geo.error}
                isFavorite={favoriteIds.includes(selectedBlock.id)}
                onToggleFavorite={() => void toggleFavorite(selectedBlock.id)}
              />
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>

      {!selectedBlock ? <BottomNav active={nav} onNavigate={setNav} /> : null}
    </>
  );
}
