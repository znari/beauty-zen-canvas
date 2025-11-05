import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroMockup from "@/assets/hero-mockup.jpg";

export const HeroSection = () => {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Copy + CTAs */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Diga adeus à papelada. <br />
                <span className="text-secondary">Dê um 'Zen' no seu estúdio.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                O FichaZen digitaliza fichas de anamnese, organiza seus clientes e automatiza confirmações via WhatsApp — tudo em minutos.
              </p>
            </div>

            {/* Trust Line */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-semibold">Teste grátis por 15 dias — sem cartão de crédito.</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild className="group">
                <a href="/registro">
                  Teste grátis por 15 dias
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="outline" size="xl" onClick={scrollToFeatures}>
                Ver Funcionalidades
              </Button>
            </div>

            {/* Micro Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Sem cartão</p>
                  <p className="text-xs text-muted-foreground">No teste grátis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Clientes Ilimitados</p>
                  <p className="text-xs text-muted-foreground">Na versão PRO</p>
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
