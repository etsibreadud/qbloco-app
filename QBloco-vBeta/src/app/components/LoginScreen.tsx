import { useState } from "react";
import { LogIn, ChevronLeft } from "lucide-react";

interface LoginScreenProps {
  onBack?: () => void;
  onRequestMagicLink: (email: string) => Promise<void>;
}

export function LoginScreen({ onBack, onRequestMagicLink }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsLoading(true);
    try {
      await onRequestMagicLink(trimmed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        ) : null}

        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Entrar no QBloco</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Use seu e-mail para receber um link de acesso. Assim, suas conquistas ficam salvas na sua conta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? "Enviando..." : "Receber link de acesso"}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
              Enviaremos um link mágico para o seu e-mail. Clique no link para concluir o login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
