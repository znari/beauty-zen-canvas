import { TrendingUp, Clock, DollarSign, Heart } from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Economize 10h por semana",
      description: "Automatize confirmações, fichas e organização. Foque no atendimento.",
      metric: "83%",
      metricLabel: "menos tempo administrativo"
    },
    {
      icon: DollarSign,
      title: "Aumente seu faturamento",
      description: "Menos faltas com lembretes automáticos. Mais clientes com organização.",
      metric: "R$ 1.500+",
      metricLabel: "economia média/mês",
      highlight: true
    },
    {
      icon: TrendingUp,
      title: "Cresça com dados reais",
      description: "Relatórios de faturamento, top procedimentos e clientes. Decisões inteligentes.",
      metric: "100%",
      metricLabel: "visibilidade financeira"
    },
    {
      icon: Heart,
      title: "Experiência profissional",
      description: "Seus clientes recebem fichas digitais modernas e atendimento organizado.",
      metric: "⭐ 4.9/5",
      metricLabel: "satisfação dos clientes"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          {/* Prova Social */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-sm text-muted-foreground">4.9/5 de 500+ profissionais</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O ROI que você precisa ver para acreditar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profissionais que usam FichaZen economizam tempo e aumentam receita
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`relative bg-card p-6 rounded-xl shadow-card border transition-all duration-300 
                hover:-translate-y-1 hover:shadow-lg group overflow-hidden
                ${benefit.highlight 
                  ? 'border-secondary/50 hover:border-secondary' 
                  : 'border-border hover:border-secondary/50'
                }
                opacity-0 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {benefit.highlight && (
                <div className="absolute -top-3 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full animate-badge-pop">
                  MAIS POPULAR
                </div>
              )}
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {benefit.description}
                </p>

                <div 
                  className="pt-4 border-t border-border opacity-0 animate-counter-up"
                  style={{ animationDelay: `${0.5 + index * 0.15}s`, animationFillMode: 'forwards' }}
                >
                  <p className="text-2xl font-bold text-secondary mb-1">
                    {benefit.metric}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {benefit.metricLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
