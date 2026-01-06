import { ArrowRight, Sparkles, Ticket, MapPin, Heart, Route, User } from "lucide-react";
import { HeroBanner } from "../components/HeroBanner";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export function HomePage({
  onGoSchedule,
  isLoggedIn,
}: {
  onGoSchedule: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <div className="space-y-6 pb-24">
      <HeroBanner />

      <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-7">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-700" />
          <h3 className="text-lg font-extrabold text-gray-900">QBloco, sem fricção</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          A ideia é simples: você escolhe seu bloco, salva os favoritos e, quando estiver na rua, faz check-in e check-out para
          registrar sua trilha no carnaval. O app foca em informação rápida (data, horário, bairro, metrô, lotação e avaliação) e
          em uma experiência de navegação que parece nativa, não um site.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onGoSchedule}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95"
          >
            Ver programação
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button variant="outline" onClick={onGoSchedule} className="rounded-2xl">
            Explorar filtros e favoritos
          </Button>
        </div>

        <div className="mt-5 text-sm text-gray-700">
          {isLoggedIn
            ? "Você já está logada: abra um bloco e faça check-in quando começar a andar."
            : "Para ativar check-in/check-out e acompanhar distância, faça login na aba “Você”."}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="rounded-3xl border-purple-100 shadow-lg">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-purple-700" />
            </div>
            <div className="mt-4 font-extrabold text-gray-900">Programação com contexto</div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Lista enxuta, filtros úteis, busca rápida e cards com as informações que realmente decidem o seu roteiro.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-purple-100 shadow-lg">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-700" />
            </div>
            <div className="mt-4 font-extrabold text-gray-900">Favoritos</div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Salve blocos com um toque e use o filtro “Favoritos” para enxergar apenas o seu roteiro.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-purple-100 shadow-lg">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Route className="w-6 h-6 text-purple-700" />
            </div>
            <div className="mt-4 font-extrabold text-gray-900">Check-in e distância</div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Comece no check-in e finalize no check-out. O app estima quantos metros/quilômetros você caminhou.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-purple-100 shadow-lg">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-700" />
            </div>
            <div className="mt-4 font-extrabold text-gray-900">Seu painel</div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Veja distância acumulada, badges e histórico de blocos. A evolução fica clara e divertida.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-7">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-purple-700" />
          <h3 className="text-lg font-extrabold text-gray-900">Dica rápida</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Para navegação e segurança, considere usar o metrô como âncora do seu roteiro. No detalhe do bloco, você pode abrir o
          mapa do celular com um toque.
        </p>
      </div>
    </div>
  );
}
