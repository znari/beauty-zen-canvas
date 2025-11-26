import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

export const CTABanner = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-30"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Pare de perder tempo (e dinheiro).
            <br />
            <span className="text-secondary">Comece seu teste grátis agora.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a +500 profissionais que já economizam 10h por semana com o FichaZen
          </p>
          
          {/* Bonus badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/20 px-6 py-3 rounded-full mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <span className="text-sm font-semibold text-foreground">🎁 Bônus: Primeiros 100 cadastros ganham 1 mês extra grátis</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button variant="hero" size="xl" asChild className="group shadow-button">
              <a href="/registro">
                Começar teste grátis agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a 
                href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Quero%20falar%20com%20um%20especialista%20sobre%20o%20FichaZen`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                💬 Falar com especialista
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-secondary">✅</span>
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary">✅</span>
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary">✅</span>
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
