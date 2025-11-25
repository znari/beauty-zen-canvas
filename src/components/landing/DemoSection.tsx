import { Play } from "lucide-react";
import agendaPreview from "@/assets/agenda-preview.jpg";

export const DemoSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Veja o FichaZen em ação
            </h2>
            <p className="text-lg text-muted-foreground">
              Interface intuitiva que você domina em minutos
            </p>
          </div>
          
          {/* Demo Preview */}
          <div className="relative animate-fade-in group">
            <div className="rounded-2xl overflow-hidden shadow-soft hover-lift border-4 border-primary/20">
              <img 
                src={agendaPreview} 
                alt="Demonstração da interface do FichaZen - Agenda e gestão de clientes" 
                className="w-full h-auto"
              />
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center shadow-button cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>
            </div>

            {/* Feature callouts */}
            <div className="absolute -left-4 top-1/4 bg-card px-4 py-2 rounded-lg shadow-card border border-border hidden lg:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <p className="text-xs font-semibold text-foreground">✨ Agenda semanal visual</p>
            </div>
            
            <div className="absolute -right-4 top-1/2 bg-card px-4 py-2 rounded-lg shadow-card border border-border hidden lg:block animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <p className="text-xs font-semibold text-foreground">📊 Relatórios em tempo real</p>
            </div>
            
            <div className="absolute -left-4 bottom-1/4 bg-card px-4 py-2 rounded-lg shadow-card border border-border hidden lg:block animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <p className="text-xs font-semibold text-foreground">💬 WhatsApp integrado</p>
            </div>
          </div>

          {/* Key features below demo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-2xl font-bold text-secondary mb-1">1 clique</p>
              <p className="text-sm text-muted-foreground">Enviar ficha</p>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-2xl font-bold text-secondary mb-1">5 min</p>
              <p className="text-sm text-muted-foreground">Configuração inicial</p>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <p className="text-2xl font-bold text-secondary mb-1">100%</p>
              <p className="text-sm text-muted-foreground">Responsivo</p>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <p className="text-2xl font-bold text-secondary mb-1">Ilimitado</p>
              <p className="text-sm text-muted-foreground">No plano Pro</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
