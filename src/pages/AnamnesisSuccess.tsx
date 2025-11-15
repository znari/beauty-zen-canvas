import { useSearchParams } from "react-router-dom";
import { CheckCircle2, MessageCircle, Calendar, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AnamnesisSuccess = () => {
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const professional = searchParams.get("professional") || "";

  const handleWhatsAppContact = () => {
    const studioPhone = "5565993550830";
    const message = encodeURIComponent("Olá! Acabei de preencher minha ficha de anamnese e gostaria de confirmar os detalhes.");
    window.open(`https://wa.me/${studioPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card principal */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8 space-y-8">
          {/* Ícone de sucesso */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-success-foreground" />
            </div>
          </div>

          {/* Título */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Ficha enviada com sucesso! 🎉
            </h1>
            <p className="text-foreground-secondary">
              Sua ficha de anamnese foi recebida
            </p>
          </div>

          {/* Próximos passos */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Próximos passos
              </h2>

              <div className="space-y-4">
                {/* Passo 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-foreground">Confirmação</h3>
                    </div>
                    <p className="text-sm text-foreground-secondary">
                      Você receberá uma confirmação no WhatsApp
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                {date && time && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Lembre-se</h3>
                      </div>
                      <p className="text-sm text-foreground-secondary">
                        Seu agendamento é para <span className="font-semibold text-foreground">{date}</span> às <span className="font-semibold text-foreground">{time}</span>
                        {professional && ` com ${professional}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Passo 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-foreground">Chegue com antecedência</h3>
                    </div>
                    <p className="text-sm text-foreground-secondary">
                      Sugerimos chegar 10 minutos antes do horário agendado
                    </p>
                  </div>
                </div>

                {/* Passo 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-foreground">Dúvidas?</h3>
                    </div>
                    <p className="text-sm text-foreground-secondary">
                      Entre em contato pelo WhatsApp a qualquer momento
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de contato */}
          <Button
            onClick={handleWhatsAppContact}
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Falar com o estúdio
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-foreground-secondary">
            © 2025 FichaZen 🌷
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnamnesisSuccess;
