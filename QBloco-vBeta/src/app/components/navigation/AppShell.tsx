import { ReactNode } from "react";
import { Logo } from "../Logo";
import { Toaster } from "sonner";

export function AppShell({
  title,
  right,
  children,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50">
      <div className="sticky top-0 z-10 bg-white/75 backdrop-blur border-b border-purple-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo />
            {title ? (
              <div className="min-w-0">
                <div className="text-base font-extrabold text-gray-900 truncate">{title}</div>
              </div>
            ) : null}
          </div>
          {right}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>

      <Toaster richColors position="top-center" />
    </div>
  );
}
