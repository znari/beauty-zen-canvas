import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Zap, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const PricingSection = () => {
  const plans = [
    {
      id: 'essencial',
      name: 'Zen Essencial',
      price: '39,90',
      description: 'Perfeito para começar',
      icon: Sparkles,
      features: [
        'Até 10 clientes',
        'Até 10 fichas de anamnese',
        '2GB de armazenamento',
        '1 profissional',
        '11 templates de mensagens',
        'WhatsApp integrado',
        'Fotos antes/depois',
        'Notificações automáticas',
        'Relatórios básicos',
        'Suporte via WhatsApp'
      ],
      highlighted: false,
      cta: 'Começar teste grátis',
      ctaLink: '/registro'
    },
    {
      id: 'pro',
      name: 'Zen Pro',
      price: '89,90',
      description: 'Para crescer sem limites',
      icon: Crown,
      badge: '🔥 Mais Popular',
      features: [
        'Clientes ILIMITADOS ⭐',
        'Fichas ILIMITADAS ⭐',
        '10GB de armazenamento',
        'Até 5 profissionais',
        'Tudo do Essencial +',
        'Relatórios avançados com gráficos',
        'Exportação PDF profissional',
        'Top 5 procedimentos e clientes',
        'Gráficos de faturamento',
        'Suporte prioritário'
      ],
      highlighted: true,
      cta: 'Começar teste grátis',
      ctaLink: '/registro'
    },
    {
      id: 'ultimate',
      name: 'Zen Ultimate',
      price: '129,90',
      description: 'Potência máxima',
      icon: Zap,
      features: [
        'TUDO ILIMITADO ⭐⭐⭐',
        'Clientes ilimitados',
        'Fichas ilimitadas',
        'Armazenamento ilimitado',
        'Profissionais ilimitados',
        'Tudo do Pro +',
        'Backup diário automático',
        'Treinamento personalizado',
        'Suporte VIP (resposta em 1h)',
        'Acesso antecipado a novidades'
      ],
      highlighted: false,
      cta: 'Começar teste grátis',
      ctaLink: '/registro'
    },
    {
      id: 'ultimate_plus',
      name: 'Zen Ultimate + IA',
      price: null,
      description: 'Futuro da automação',
      icon: MessageCircle,
      badge: '🚀 Em breve',
      features: [
        'Tudo do Ultimate +',
        'Agente de IA no WhatsApp 🤖',
        'Agendamentos automáticos',
        'Respostas inteligentes 24/7',
        'Confirmações automáticas',
        'Lembretes personalizados',
        'Entre em contato para saber mais'
      ],
      highlighted: false,
      cta: 'Quero saber mais',
      ctaLink: 'https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20Zen%20Ultimate%20%2B%20IA',
      comingSoon: true
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comece grátis. Cresça com o FichaZen. <span className="text-secondary">Cancele quando quiser.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Teste todas as funcionalidades por 15 dias, sem cartão de crédito
          </p>
          <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
            <span className="text-sm font-semibold text-secondary">🎁 Oferta de lançamento: 15 dias grátis para todos</span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.highlighted 
                    ? 'border-2 border-secondary shadow-lg scale-105' 
                    : 'border border-border'
                } ${plan.comingSoon ? 'opacity-95' : ''}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-secondary-foreground font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  {/* Price */}
                  <div className="pt-4">
                    {plan.price ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-foreground">R$ {plan.price}</span>
                          <span className="text-muted-foreground text-sm">/ mês</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-foreground">
                        Sob consulta
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <ul className="space-y-2 min-h-[300px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant={plan.highlighted ? "hero" : "outline"}
                    size="lg"
                    className={`w-full ${plan.highlighted ? 'shadow-button' : ''}`}
                    asChild
                  >
                    {plan.comingSoon ? (
                      <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                        {plan.cta}
                      </a>
                    ) : (
                      <a href={plan.ctaLink}>
                        {plan.cta}
                      </a>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust line */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            💳 <strong>Todos os planos incluem 15 dias de teste grátis</strong> — sem necessidade de cartão de crédito
          </p>
          <p className="text-sm text-muted-foreground">
            ✅ Sem compromisso • ✅ Cancele quando quiser • ✅ Sem multa ou fidelidade
          </p>
        </div>

        {/* Comparison CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-2">
            Não tem certeza qual plano escolher? 
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://wa.me/5511999999999?text=Tenho%20dúvidas%20sobre%20os%20planos" target="_blank" rel="noopener noreferrer">
              Falar com especialista no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
