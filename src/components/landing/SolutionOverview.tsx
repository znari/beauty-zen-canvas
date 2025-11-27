import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const SolutionOverview = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 animate-fade-in-up">
            A solução completa que economiza 10h por semana
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card p-6 rounded-xl shadow-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">Anamnese digital</p>
              <p className="text-xs text-muted-foreground mt-1">Cliente preenche online</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl shadow-card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">WhatsApp integrado</p>
              <p className="text-xs text-muted-foreground mt-1">11 templates prontos</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl shadow-card animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">Tudo organizado</p>
              <p className="text-xs text-muted-foreground mt-1">Fotos, agenda, relatórios</p>
            </div>
          </div>

          <Button variant="hero" size="lg" asChild className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/registro">
              Começar meu teste grátis agora
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
