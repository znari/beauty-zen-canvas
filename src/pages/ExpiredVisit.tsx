import { Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExpiredVisit = () => {
  const handleWhatsAppContact = () => {
    // Número do studio - pode ser configurado futuramente
    const studioPhone = "5565993550830";
    const message = encodeURIComponent("Olá! Preciso preencher minha ficha de anamnese ou reagendar minha visita.");
    window.open(`https://wa.me/${studioPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8 text-center space-y-6">
          {/* Ícone */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-destructive" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                <span className="text-white text-xl font-bold">✕</span>
              </div>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Ops! Esta visita já aconteceu
            </h1>
            <p className="text-foreground-secondary text-sm leading-relaxed">
              O link que você acessou era para uma visita que já passou. Para preencher sua ficha de anamnese ou agendar um novo horário, entre em contato com o estúdio.
            </p>
          </div>

          {/* Botão de contato */}
          <Button
            onClick={handleWhatsAppContact}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-hover)] transition-all"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Entrar em contato via WhatsApp
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

export default ExpiredVisit;
