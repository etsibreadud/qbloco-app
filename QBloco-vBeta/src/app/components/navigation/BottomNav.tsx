import { Calendar, Home, User } from "lucide-react";

export type NavKey = "home" | "schedule" | "profile";

export function BottomNav({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}) {
  const base =
    "flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition-colors";
  const activeCls = "bg-white text-purple-700 shadow-sm";
  const idleCls = "text-gray-600 hover:text-purple-700";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <div className="rounded-3xl bg-white/70 backdrop-blur border border-purple-100 shadow-lg p-2 flex items-center justify-between">
          <button
            className={`${base} ${active === "home" ? activeCls : idleCls}`}
            onClick={() => onNavigate("home")}
            aria-label="Início"
          >
            <Home className="h-5 w-5" />
            Início
          </button>

          <button
            className={`${base} ${active === "schedule" ? activeCls : idleCls}`}
            onClick={() => onNavigate("schedule")}
            aria-label="Programação"
          >
            <Calendar className="h-5 w-5" />
            Programação
          </button>

          <button
            className={`${base} ${active === "profile" ? activeCls : idleCls}`}
            onClick={() => onNavigate("profile")}
            aria-label="Usuário"
          >
            <User className="h-5 w-5" />
            Você
          </button>
        </div>
      </div>
    </div>
  );
}
