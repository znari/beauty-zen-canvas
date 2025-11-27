import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, ImageIcon, Calendar, DollarSign, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export const FeaturesSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "WhatsApp Integrado com Templates",
      description: "11 modelos de mensagens prontas para confirmação, lembrete, boas-vindas e mais",
      benefits: [
        "Envie ficha de anamnese com 1 clique",
        "Copie mensagens formatadas instantaneamente",
        "Economize 2h/dia em mensagens repetitivas"
      ]
    },
    {
      icon: FileText,
      title: "Ficha de Anamnese Digital",
      description: "Campos condicionais personalizáveis com assinatura digital válida",
      benefits: [
        "Cliente preenche online com link único",
        "Reduza 80% do tempo de preenchimento",
        "Histórico completo e seguro na nuvem"
      ]
    },
    {
      icon: ImageIcon,
      title: "Galeria Privada Antes/Depois",
      description: "Armazene fotos organizadas por cliente e procedimento com total privacidade",
      benefits: [
        "Lightbox profissional para visualização",
        "Storage privado com criptografia RLS",
        "Nunca mais perca fotos no rolo da câmera"
      ]
    },
    {
      icon: Calendar,
      title: "Agenda Semanal + Mensal",
      description: "Visualização completa com status visual inteligente de cada agendamento",
      benefits: [
        "Pendente (amarelo), confirmado (verde), cancelado (vermelho)",
        "Reagendamento com 2 cliques",
        "Navegação entre semanas e meses"
      ]
    },
    {
      icon: DollarSign,
      title: "Relatórios de Faturamento",
      description: "Dashboard completo com gráficos interativos e análise de performance",
      benefits: [
        "Faturamento diário, semanal e mensal",
        "Top 5 procedimentos + Top 5 clientes",
        "Exportação em PDF profissional"
      ]
    },
    {
      icon: Bell,
      title: "Notificações Automáticas",
      description: "Sistema inteligente de lembretes e alertas para você e seus clientes",
      benefits: [
        "Lembretes de renovação (5 dias antes)",
        "Alertas de anamnese pendente",
        "Notificações de pagamentos recebidos"
      ]
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todas as ferramentas que você precisa em <span className="text-secondary">1 só lugar</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema completo para gestão de clientes, procedimentos e faturamento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card p-8 rounded-xl shadow-card hover-lift animate-fade-in-up border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-xl gradient-hero flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-secondary" />
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

        {/* Extra features highlight */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 max-w-4xl mx-auto mb-8">
          <h3 className="text-xl font-bold text-foreground text-center mb-6">
            Mais recursos inclusos em todos os planos:
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-semibold text-foreground">✅ Backup automático</p>
              <p className="text-xs text-muted-foreground mt-1">Dados sempre seguros</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">✅ Multi-dispositivo</p>
              <p className="text-xs text-muted-foreground mt-1">Celular + computador</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">✅ Perfil personalizado</p>
              <p className="text-xs text-muted-foreground mt-1">Foto, dados, configurações</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" asChild className="shadow-button">
            <Link to="/registro">Começar teste grátis de 15 dias</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            ✨ Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
};
