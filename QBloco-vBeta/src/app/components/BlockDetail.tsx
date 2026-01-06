import { useMemo, useState } from "react";
import { Calendar, Clock, MapPin, MessageCircle, Star, Heart, Navigation, Play, Square, AlertTriangle } from "lucide-react";
import type { Block } from "./BlockCard";
import { TagChip } from "./TagChip";
import { RatingBar, RatingDisplay } from "./RatingBar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface Comment {
  id: string;
  date: string;
  text: string;
  rating: number;
}

interface BlockDetailProps {
  block: Block;
  onBack: () => void;

  // auth / gamificação
  isLoggedIn: boolean;
  onRequestLogin: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isTracking: boolean;
  liveDistanceLabel: string;
  geoError?: string | null;

  // favoritos
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const sampleComments: Comment[] = [
  {
    id: "1",
    date: "2026-02-15",
    text: "Som ótimo e clima animado. Cheguei cedo e foi perfeito.",
    rating: 5,
  },
  {
    id: "2",
    date: "2026-02-10",
    text: "Organização boa e energia alta. Volto com certeza.",
    rating: 4,
  },
];

function crowdLabel(crowd: Block["expectedCrowd"]) {
  if (crowd === "low") return "Tranquilo";
  if (crowd === "medium") return "Moderado";
  if (crowd === "high") return "Lotado";
  return "Mega lotado";
}

export function BlockDetail({
  block,
  isLoggedIn,
  onRequestLogin,
  onCheckIn,
  onCheckOut,
  isTracking,
  liveDistanceLabel,
  geoError,
  isFavorite,
  onToggleFavorite,
}: BlockDetailProps) {
  const [userRating, setUserRating] = useState(block.rating);

  const mapsHref = useMemo(() => {
    // Sem endereço estruturado, usamos bairro + Rio de Janeiro como fallback.
    const q = encodeURIComponent(`${block.neighborhood}, Rio de Janeiro`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }, [block.neighborhood]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-purple-600 text-white">{block.date}</Badge>
              <Badge variant="secondary" className="rounded-full">
                {block.time}
              </Badge>
              <Badge variant="outline" className="rounded-full border-purple-100 text-gray-800">
                {crowdLabel(block.expectedCrowd)}
              </Badge>
            </div>

            <div className="mt-3 text-sm text-gray-700 flex items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-700" />
                <span className="truncate">{block.neighborhood}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="truncate">Metrô: {block.metro}</span>
            </div>

            {block.description ? (
              <p className="mt-4 text-gray-700 leading-relaxed">{block.description}</p>
            ) : (
              <p className="mt-4 text-gray-700 leading-relaxed">
                Tudo que você precisa para decidir rápido: onde é, que horas começa e como costuma estar a lotação.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            className={
              "shrink-0 inline-flex items-center justify-center rounded-2xl p-3 border transition-colors " +
              (isFavorite ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-purple-100 text-purple-700 hover:bg-purple-50")
            }
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={"w-5 h-5 " + (isFavorite ? "fill-white" : "")} />
          </button>
        </div>

        {block.tags && block.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {block.tags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-3xl border border-purple-100 bg-purple-50/60 p-4 hover:bg-purple-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Navigation className="w-4 h-4 text-purple-700" />
              Abrir no mapa
            </div>
            <div className="mt-1 text-sm text-gray-700 truncate">{block.neighborhood}</div>
          </a>

          <div className="rounded-3xl border border-purple-100 bg-purple-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Star className="w-4 h-4 text-yellow-500" />
              Avaliação
            </div>
            <div className="mt-1 flex items-center justify-between">
              <RatingDisplay rating={userRating} />
              <span className="text-sm font-extrabold text-gray-900">{userRating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm font-extrabold text-gray-900 mb-2">Sua nota (MVP)</div>
          <RatingBar rating={userRating} onChange={setUserRating} />
          <div className="mt-2 text-xs text-gray-600">
            No MVP, a nota fica local no dispositivo. Depois, dá para persistir no Supabase.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-extrabold text-gray-900">Check-in</div>
            <div className="mt-1 text-sm text-gray-700">
              {isTracking ? "Você está com a trilha ativa neste bloco." : "Ative para estimar a distância percorrida."}
            </div>
          </div>
          {isTracking ? (
            <Badge className="rounded-full bg-pink-500 text-white">ao vivo • {liveDistanceLabel}</Badge>
          ) : null}
        </div>

        {geoError ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div>{geoError}</div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {!isTracking ? (
            <Button
              onClick={() => (isLoggedIn ? onCheckIn() : onRequestLogin())}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95"
            >
              <Play className="w-4 h-4 mr-2" />
              Fazer check-in
            </Button>
          ) : (
            <Button onClick={onCheckOut} className="rounded-2xl bg-gray-900 hover:bg-gray-900/90">
              <Square className="w-4 h-4 mr-2" />
              Fazer check-out
            </Button>
          )}

          <Button variant="outline" className="rounded-2xl" onClick={() => window.open(mapsHref, "_blank")}>
            <MapPin className="w-4 h-4 mr-2" />
            Ver rota
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-6">
        <Collapsible>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-700" />
              <div className="text-base font-extrabold text-gray-900">Comentários (MVP)</div>
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="outline" className="rounded-2xl">
                Ver
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-4 space-y-3">
            {sampleComments.map((c) => (
              <div key={c.id} className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-gray-900">{c.date}</div>
                  <RatingDisplay rating={c.rating} />
                </div>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
