import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTABanner = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Comece grátis e organize seu estúdio hoje
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já transformaram sua gestão com o FichaZen
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" asChild className="group">
              <a href="/registro">
                Teste grátis por 15 dias
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
