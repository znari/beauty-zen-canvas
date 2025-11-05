import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const PricingSection = () => {
  const features = [
    "Clientes Ilimitados",
    "Fichas Ilimitadas",
    "Envio de Confirmações via WhatsApp",
    "Histórico com Fotos Antes/Depois",
    "Cadastro de Procedimentos",
    "Suporte por WhatsApp"
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simples e direto
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Um único plano com tudo que você precisa para organizar seu estúdio
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl shadow-soft p-8 border-2 border-secondary relative overflow-hidden animate-fade-in-up">
            {/* Badge */}
            <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-4 py-1 rounded-bl-xl font-semibold text-sm">
              Mais Popular
            </div>

            {/* Plan Name */}
            <div className="mb-6 pt-4">
              <h3 className="text-2xl font-bold text-foreground mb-2">Zen PRO</h3>
              <p className="text-muted-foreground">Tudo que você precisa para crescer</p>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-foreground">R$ 29,90</span>
                <span className="text-muted-foreground">/ mês</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-secondary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button variant="hero" size="xl" className="w-full" asChild>
              <a href="/registro">Comece seu teste grátis de 15 dias</a>
            </Button>

            {/* Note */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Sem cartão de crédito no cadastro
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
