import { Trophy, Route, LogOut, LogIn, MapPin, Heart, Clock3 } from "lucide-react";
import { formatDistance } from "../lib/distance";
import { LoginScreen } from "../components/LoginScreen";
import type { Block } from "../components/BlockCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { AdminPanel } from "../components/AdminPanel";

export type VisitRecord = {
  id: string;
  blockName: string;
  blockDate: string;
  checkInAt: string;
  checkOutAt: string;
  distanceMeters: number;
};

export type UserStats = {
  totalDistanceMeters: number;
  totalVisits: number;
  visits: VisitRecord[];
  badges: string[];
};

export function ProfilePage({
  userEmail,
  onRequestMagicLink,
  onLogout,
  stats,
  favorites,
  activeVisit,
  activeDistance,
  isAdmin,
  adminBlocks,
  onRefreshBlocks,
}: {
  userEmail: string | null;
  onRequestMagicLink: (email: string) => Promise<void>;
  onLogout: () => Promise<void>;
  stats: UserStats;
  favorites: Block[];
  activeVisit: { blockName: string; blockDate: string; checkInAt: string } | null;
  activeDistance: number;
  isAdmin: boolean;
  adminBlocks: Block[];
  onRefreshBlocks: () => void;
}) {
  if (!userEmail) {
    return (
      <div className="space-y-5 pb-24">
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6">
          <div className="text-lg font-extrabold text-gray-900 mb-2">Sua conta</div>
          <p className="text-gray-700 leading-relaxed">
            Entre para salvar favoritos, fazer check-in/check-out e acompanhar sua trilha de caminhada no carnaval.
          </p>
          <div className="mt-5">
            <LoginScreen onRequestMagicLink={onRequestMagicLink} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <div className="text-base font-extrabold text-gray-900">Gamificação</div>
              <div className="text-sm text-gray-700">Check-in, check-out e distância acumulada.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topBadges = (stats.badges || []).slice(0, 6);

  return (
    <div className="space-y-5 pb-24">
      {activeVisit ? (
        <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl shadow-xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm/none opacity-90">Em andamento</div>
              <div className="mt-2 text-xl font-extrabold truncate">{activeVisit.blockName}</div>
              <div className="mt-2 flex items-center gap-2 text-sm opacity-95">
                <Clock3 className="w-4 h-4" />
                <span>Check-in {new Date(activeVisit.checkInAt).toLocaleTimeString()}</span>
                <span className="opacity-70">•</span>
                <span>{activeVisit.blockDate}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm/none opacity-90">Distância</div>
              <div className="mt-2 text-2xl font-extrabold">{formatDistance(activeDistance)}</div>
              <div className="mt-1 text-xs opacity-90">Atualiza em tempo real</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Route className="w-5 h-5 text-purple-700" />
            Distância total
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{formatDistance(stats.totalDistanceMeters)}</div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Trophy className="w-5 h-5 text-purple-700" />
            Blocos visitados
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{stats.totalVisits}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <div className="text-base font-extrabold text-gray-900">Badges</div>
              <div className="text-sm text-gray-700">Recompensas por presença e distância.</div>
            </div>
          </div>

          <Button variant="outline" onClick={() => void onLogout()} className="rounded-2xl">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {topBadges.length ? (
            topBadges.map((b) => (
              <Badge key={b} className="rounded-full px-3 py-1 text-sm">
                {b}
              </Badge>
            ))
          ) : (
            <div className="text-sm text-gray-700">Faça um check-out para desbloquear seus primeiros badges.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Heart className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <div className="text-base font-extrabold text-gray-900">Favoritos</div>
            <div className="text-sm text-gray-700">Seus blocos salvos para o roteiro.</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {favorites.length ? (
            favorites.slice(0, 6).map((b) => (
              <Card key={b.id} className="rounded-3xl border-purple-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="font-extrabold text-gray-900 truncate">{b.name}</div>
                  <div className="mt-1 text-sm text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-700" />
                    <span className="truncate">{b.neighborhood}</span>
                    <span className="text-gray-300">•</span>
                    <span className="truncate">{b.date} {b.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-sm text-gray-700">
              Você ainda não favoritou nenhum bloco. Vá em “Programação” e toque no coração para salvar.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6">
        <div className="text-base font-extrabold text-gray-900">Histórico</div>
        <div className="mt-4 space-y-3">
          {stats.visits.length ? (
            stats.visits
              .slice()
              .reverse()
              .slice(0, 10)
              .map((v) => (
                <div key={v.id} className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                  <div className="font-extrabold text-gray-900 truncate">{v.blockName}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    {v.blockDate} • {formatDistance(v.distanceMeters)}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {new Date(v.checkInAt).toLocaleTimeString()} – {new Date(v.checkOutAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-sm text-gray-700">Sem registros ainda. Faça check-in e depois check-out em um bloco.</div>
          )}
        </div>
      </div>

      {isAdmin ? (
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-extrabold text-gray-900">Admin</div>
              <div className="text-sm text-gray-700">Área restrita para criar, editar e excluir blocos.</div>
            </div>
            <Button variant="outline" onClick={onRefreshBlocks} className="rounded-2xl">
              Recarregar lista
            </Button>
          </div>

          <AdminPanel blocks={adminBlocks} onRefresh={onRefreshBlocks} />
        </div>
      ) : null}
    </div>
  );
}