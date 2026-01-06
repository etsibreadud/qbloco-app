import { useState } from "react";
import { SlidersHorizontal, X, Heart } from "lucide-react";
import { Switch } from "./ui/switch";

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  currentFilters: Filters;
}

export interface Filters {
  date: string;
  search: string;
  timeOfDay: string;
  targetAudience: string;
  neighborhood: string;
  crowd: string;
  favoritesOnly: boolean;
}

const timeOptions = [
  { value: "", label: "Todos os horários" },
  { value: "morning", label: "Manhã (até 12h)" },
  { value: "afternoon", label: "Tarde (12h–18h)" },
  { value: "evening", label: "Noite (após 18h)" },
];

const audienceOptions = [
  { value: "", label: "Todos os públicos" },
  { value: "jovem", label: "Jovem" },
  { value: "lgbt", label: "LGBT" },
  { value: "familia", label: "Família" },
  { value: "tradicional", label: "Tradicional" },
];

const crowdOptions = [
  { value: "", label: "Qualquer lotação" },
  { value: "low", label: "Tranquilo" },
  { value: "medium", label: "Moderado" },
  { value: "high", label: "Lotado" },
  { value: "very-high", label: "Mega lotado" },
];

export function FilterPanel({ onFilterChange, currentFilters }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    onFilterChange({ ...currentFilters, [key]: value } as Filters);
  };

  const clearFilters = () => {
    onFilterChange({
      date: "",
      search: "",
      timeOfDay: "",
      targetAudience: "",
      neighborhood: "",
      crowd: "",
      favoritesOnly: false,
    });
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

        {(currentFilters.date ||
          currentFilters.timeOfDay ||
          currentFilters.targetAudience ||
          currentFilters.neighborhood ||
          currentFilters.crowd ||
          currentFilters.favoritesOnly) && (
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
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Data</label>
              <input
                type="date"
                value={currentFilters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Horário</label>
              <select
                value={currentFilters.timeOfDay}
                onChange={(e) => handleFilterChange("timeOfDay", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
              >
                {timeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Público</label>
              <select
                value={currentFilters.targetAudience}
                onChange={(e) => handleFilterChange("targetAudience", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none"
              >
                {audienceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
