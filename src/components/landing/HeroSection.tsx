import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import heroMockup from "@/assets/hero-mockup.jpg";

export const HeroSection = () => {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copy + CTAs */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                Economize <span className="text-secondary">10h por semana</span> com Gestão de Clientes em Piloto Automático
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl">
                Anamnese digital + WhatsApp integrado + Fotos organizadas + Relatórios financeiros. Tudo em 1 lugar.
              </p>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="font-semibold">+500 profissionais já usam</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="font-semibold">Dados criptografados</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="font-semibold">Teste grátis sem cartão</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button variant="hero" size="lg" asChild className="group shadow-button w-full sm:w-auto">
                <Link to="/registro">
                  Começar meu teste grátis agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToFeatures} className="w-full sm:w-auto">
                Ver demonstração
              </Button>
            </div>

            {/* Micro Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">15 dias grátis</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Sem cartão de crédito</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">Ilimitado</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Clientes no plano Pro</p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">5 minutos</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Para começar a usar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mockup */}
          <div className="relative animate-fade-in">
            <div className="relative z-10 hover-lift">
              <img 
                src={heroMockup} 
                alt="FichaZen Dashboard - Visualização de agenda e fichas digitais" 
                className="w-full h-auto rounded-3xl shadow-soft"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
