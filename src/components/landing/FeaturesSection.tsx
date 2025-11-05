import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, User } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Confirmação e ficha com 1 clique",
      description: "Gera link WhatsApp com mensagem pronta + link da ficha digital",
      benefits: ["Economize tempo", "Mensagens personalizadas", "Envio automático"]
    },
    {
      icon: FileText,
      title: "Ficha Digital Inteligente",
      description: "Formulário com lógica condicional e armazenamento seguro de respostas",
      benefits: ["Sem papel", "Respostas organizadas", "Acesso instantâneo"]
    },
    {
      icon: User,
      title: "Perfil do Cliente",
      description: "Histórico completo de visitas, notas e fotos Antes/Depois",
      benefits: ["Histórico completo", "Fotos organizadas", "Notas privadas"]
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como o FichaZen te ajuda
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatize processos e foque no que realmente importa: seus clientes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card p-8 rounded-xl shadow-card hover-lift animate-fade-in-up border border-border"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-xl gradient-hero flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-secondary-foreground" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {feature.description}
              </p>

              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="cta" size="lg" asChild>
            <a href="/registro">Comece o teste grátis</a>
          </Button>
        </div>
      </div>
    </section>
  );
};
