import { useEffect, useMemo, useState } from "react";
import { Search, Calendar, Sparkles } from "lucide-react";
import type { Block } from "../components/BlockCard";
import { BlockCard } from "../components/BlockCard";
import { FilterPanel, Filters } from "../components/FilterPanel";
import { Skeleton } from "../components/ui/skeleton";

function getTimeCategory(time: string) {
  const hour = parseInt(time.split(":")[0]);
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function SchedulePage({
  blocks,
  filters,
  onFiltersChange,
  onSelectBlock,
  favoriteIds,
  onToggleFavorite,
}: {
  blocks: Block[];
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onSelectBlock: (b: Block) => void;
  favoriteIds: string[];
  onToggleFavorite: (blockId: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  const favoritesSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      if (filters.favoritesOnly && !favoritesSet.has(block.id)) return false;

      if (filters.date && block.date !== filters.date) return false;

      if (filters.search) {
        const s = filters.search.toLowerCase();
        const hay = `${block.name} ${block.neighborhood} ${block.metro} ${(block.tags || []).join(" ")}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }

      if (filters.timeOfDay && getTimeCategory(block.time) !== filters.timeOfDay) return false;

      if (filters.targetAudience) {
        const t = filters.targetAudience.toLowerCase();
        const tags = (block.tags || []).map((x) => x.toLowerCase());
        if (!tags.some((x) => x.includes(t))) return false;
      }

      if (filters.neighborhood) {
        const n = filters.neighborhood.toLowerCase();
        if (!block.neighborhood.toLowerCase().includes(n)) return false;
      }

      if (filters.crowd && block.expectedCrowd !== filters.crowd) return false;

      return true;
    });
  }, [blocks, filters, favoritesSet]);

  return (
    <div className="space-y-5 pb-24">
      <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-extrabold text-gray-900">Programação</div>
            <div className="text-sm text-gray-700">
              Busque, filtre e salve seus favoritos para montar seu roteiro.
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 bg-gray-50 border border-purple-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-purple-200">
          <Search className="w-5 h-5 text-purple-700" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Buscar por bloco, bairro, metrô, tag…"
            className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-500 font-medium"
          />
        </div>

        <div className="mt-4">
          <FilterPanel
            currentFilters={filters}
            onFilterChange={(f) => onFiltersChange(f)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-7 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-purple-700" />
          </div>
          <div className="mt-4 text-lg font-extrabold text-gray-900">Nada por aqui</div>
          <p className="mt-2 text-gray-700">
            Tente ajustar os filtros ou remover “Favoritos” para ver mais opções.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onClick={() => onSelectBlock(block)}
              isFavorite={favoritesSet.has(block.id)}
              onToggleFavorite={() => onToggleFavorite(block.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
