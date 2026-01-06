import { Calendar, Clock, MapPin, Users, Star, Heart } from "lucide-react";
import { RatingDisplay } from "./RatingBar";

export interface Block {
  id: string;
  name: string;
  date: string;
  time: string;
  neighborhood: string;
  metro: string;
  expectedCrowd: "low" | "medium" | "high" | "very-high";
  rating: number;
  reviewCount: number;
  tags?: string[];
  description?: string;
  observations?: string;
  audiences?: string[];
  source?: string;
}

interface BlockCardProps {
  block: Block;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const crowdLabels = {
  low: "Tranquilo",
  medium: "Moderado",
  high: "Lotado",
  "very-high": "Mega Lotado",
};

export function BlockCard({ block, onClick, isFavorite, onToggleFavorite }: BlockCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl shadow-lg border border-purple-100 p-5 hover:shadow-xl hover:border-purple-200 transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-extrabold text-gray-900 truncate">{block.name}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              {block.date}
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4 text-purple-600" />
              {block.time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-gray-900">{block.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({block.reviewCount})</span>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className={
                "inline-flex items-center justify-center rounded-2xl p-2 border transition-colors " +
                (isFavorite ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-purple-100 text-purple-700 hover:bg-purple-50")
              }
            >
              <Heart className={"w-4 h-4 " + (isFavorite ? "fill-white" : "")} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-600" />
          <span className="truncate">{block.neighborhood}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <span>{crowdLabels[block.expectedCrowd]}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-pink-600" />
          <span className="truncate">Metrô: {block.metro}</span>
        </div>
        <RatingDisplay rating={block.rating} />
      </div>

      {block.tags && block.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {block.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-purple-50 text-purple-800 border border-purple-100 px-3 py-1 text-xs font-semibold"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
