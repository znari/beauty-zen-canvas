import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Zap, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/PlanCard";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

export const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'essencial',
      name: 'Zen Essencial',
      priceMonthly: 39.90,
      priceYearly: 335.16,
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
      priceMonthly: 89.90,
      priceYearly: 755.16,
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
      priceMonthly: 129.90,
      priceYearly: 1091.16,
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
      priceMonthly: null,
      priceYearly: null,
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
      ctaLink: `https://wa.me/${SUPPORT_WHATSAPP}?text=Quero%20saber%20mais%20sobre%20o%20Zen%20Ultimate%20%2B%20IA`,
      comingSoon: true
    }
  ];

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Comece grátis. Cresça com o FichaZen. <span className="text-secondary">Cancele quando quiser.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6">
            Teste todas as funcionalidades por 15 dias, sem cartão de crédito
          </p>
          
          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center p-1 sm:p-1.5 bg-muted rounded-xl mb-4 sm:mb-6">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 ease-in-out ${
                billingPeriod === 'monthly'
                  ? 'bg-background text-foreground shadow-md scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-background text-foreground shadow-md scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Anual
              <Badge className="bg-green-500 text-white text-[10px] sm:text-xs font-bold transition-transform duration-300">-30%</Badge>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
            <span className="text-sm font-semibold text-secondary">🎁 Oferta de lançamento: 15 dias grátis para todos</span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              id={plan.id}
              name={plan.name}
              description={plan.description}
              icon={plan.icon}
              features={plan.features}
              priceMonthly={plan.priceMonthly}
              priceYearly={plan.priceYearly}
              billingPeriod={billingPeriod}
              showSavings={true}
              highlighted={plan.highlighted}
              comingSoon={plan.comingSoon}
              badge={plan.badge}
              ctaText={plan.cta}
              ctaVariant={plan.highlighted ? 'hero' : 'outline'}
              ctaLink={plan.ctaLink}
              ctaLinkExternal={plan.comingSoon}
              variant="landing"
              animationDelay={index * 100}
            />
          ))}
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
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Tenho%20dúvidas%20sobre%20os%20planos`} target="_blank" rel="noopener noreferrer">
              Falar com especialista no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
