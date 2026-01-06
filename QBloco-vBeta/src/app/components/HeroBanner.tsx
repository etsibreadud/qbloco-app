export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-8 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-white mb-3">
          Carnaval 2026 🎭
        </h2>
        <p className="text-lg text-white/90 mb-4 max-w-md">
          Encontre os melhores blocos de rua do Rio de Janeiro e aproveite a maior festa do mundo!
        </p>
        <div className="flex gap-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
            <span className="text-white text-sm font-semibold">+150 Blocos</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
            <span className="text-white text-sm font-semibold">Todos os Bairros</span>
          </div>
        </div>
      </div>

      {/* Confetti decoration */}
      <div className="absolute top-4 right-4 text-4xl opacity-80">🎉</div>
      <div className="absolute bottom-6 right-12 text-3xl opacity-70">🎊</div>
      <div className="absolute top-12 left-1/3 text-2xl opacity-60">✨</div>
    </div>
  );
}
