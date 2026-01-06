import { useMemo, useState } from "react";
import { SlidersHorizontal, X, Heart } from "lucide-react";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  currentFilters: Filters;
}

export interface Filters {
  search: string;
  dateStart: string;
  dateEnd: string;
  timeOfDay: string[];
  audiences: string[];
  neighborhood: string;
  metro: string;
  crowd: "" | "low" | "medium" | "high" | "very-high";
  favoritesOnly: boolean;
  sortBy: "date" | "rating" | "crowd";
}

const timeOptions = [
  { value: "morning", label: "Manhã (até 12h)" },
  { value: "afternoon", label: "Tarde (12h–18h)" },
  { value: "evening", label: "Noite (após 18h)" },
];

const audienceOptions = ["jovem", "lgbt", "familia", "tradicional", "turista"];

export function FilterPanel({ onFilterChange, currentFilters }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string | boolean | string[]) => {
    onFilterChange({ ...currentFilters, [key]: value } as Filters);
  };

  const clearFilters = () => {
    onFilterChange({
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
  };

  const crowdOptions = useMemo(
    () => [
      { value: "", label: "Qualquer lotação" },
      { value: "low", label: "Tranquilo" },
      { value: "medium", label: "Moderado" },
      { value: "high", label: "Lotado" },
      { value: "very-high", label: "Mega lotado" },
    ],
    [],
  );

  const toggleTime = (value: string) => {
    const set = new Set(currentFilters.timeOfDay);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    handleFilterChange("timeOfDay", Array.from(set));
  };

  const toggleAudience = (value: string) => {
    const set = new Set(currentFilters.audiences);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    handleFilterChange("audiences", Array.from(set));
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl shadow-lg border border-purple-100 hover:border-purple-200 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-purple-600" />
          <span className="font-bold text-gray-900">Filtros</span>
        </button>

        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-purple-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-purple-700" />
            <span className="text-sm font-semibold text-gray-900">Favoritos</span>
          </div>
          <Switch
            checked={!!currentFilters.favoritesOnly}
            onCheckedChange={(v) => handleFilterChange("favoritesOnly", v)}
            aria-label="Mostrar apenas favoritos"
          />
        </div>

        {(currentFilters.dateStart ||
          currentFilters.dateEnd ||
          currentFilters.timeOfDay.length ||
          currentFilters.audiences.length ||
          currentFilters.neighborhood ||
          currentFilters.metro ||
          currentFilters.crowd ||
          currentFilters.favoritesOnly ||
          currentFilters.sortBy !== "date") && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-3 bg-white rounded-2xl shadow-lg border border-purple-100 text-sm font-bold text-gray-800 hover:bg-purple-50 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 bg-white rounded-3xl shadow-xl border border-purple-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-gray-900">Refinar programação</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-purple-50 rounded-2xl transition-colors"
              aria-label="Fechar filtros"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Data inicial</label>
                <input
                  type="date"
                  value={currentFilters.dateStart}
                  onChange={(e) => handleFilterChange("dateStart", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Data final</label>
                <input
                  type="date"
                  value={currentFilters.dateEnd}
                  onChange={(e) => handleFilterChange("dateEnd", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Horário</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {timeOptions.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-gray-50 px-3 py-2">
                    <Checkbox checked={currentFilters.timeOfDay.includes(o.value)} onCheckedChange={() => toggleTime(o.value)} />
                    <span className="text-sm text-gray-800">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Público-alvo (multi)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {audienceOptions.map((a) => (
                  <label key={a} className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-gray-50 px-3 py-2">
                    <Checkbox checked={currentFilters.audiences.includes(a)} onCheckedChange={() => toggleAudience(a)} />
                    <span className="text-sm text-gray-800 capitalize">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Bairro</label>
                <input
                  type="text"
                  value={currentFilters.neighborhood}
                  onChange={(e) => handleFilterChange("neighborhood", e.target.value)}
                  placeholder="Ex.: Centro, Ipanema, Lapa…"
                  className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Metrô</label>
                <input
                  type="text"
                  value={currentFilters.metro}
                  onChange={(e) => handleFilterChange("metro", e.target.value)}
                  placeholder="Ex.: Cinelândia, Carioca, Siqueira Campos…"
                  className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Lotação</label>
                <select
                  value={currentFilters.crowd}
                  onChange={(e) => handleFilterChange("crowd", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                >
                  {crowdOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Ordenação</label>
                <select
                  value={currentFilters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
                >
                  <option value="date">Data / horário</option>
                  <option value="rating">Melhor avaliação</option>
                  <option value="crowd">Menor lotação</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
