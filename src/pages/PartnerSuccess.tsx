import { Link } from "react-router-dom";
import { PartyPopper, CheckCircle2, Clock, Mail, Rocket, Lightbulb, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

const PartnerSuccess = () => {
  const steps = [
    {
      icon: CheckCircle2,
      title: "Cadastro recebido",
      description: "Sua solicitação está em análise",
      status: "completed",
    },
    {
      icon: Clock,
      title: "Análise em andamento",
      description: "Verificamos suas informações em até 48h",
      status: "current",
    },
    {
      icon: Mail,
      title: "Notificação por email",
      description: "Você receberá um email com o resultado",
      status: "pending",
    },
    {
      icon: Rocket,
      title: "Acesso ao dashboard",
      description: "Seu link de indicação estará disponível",
      status: "pending",
    },
  ];

  const tips = [
    "Conheça mais sobre o FichaZen e seus recursos",
    "Pense em profissionais que se beneficiariam do sistema",
    "Prepare sua estratégia de divulgação",
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "current":
        return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Olá! Acabei de me cadastrar como parceiro e gostaria de mais informações.")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 animate-bounce">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Solicitação Enviada com Sucesso!
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Obrigado por querer fazer parte do nosso programa de parceiros!
            </p>
          </div>

          {/* Timeline */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                📋 Próximos Passos
              </h2>
              
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusStyles(step.status)}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{step.title}</h3>
                        {step.status === "current" && (
                          <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 text-xs">
                            Em andamento
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Enquanto aguarda
              </h2>
              
              <ul className="space-y-3">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Dúvidas? Entre em contato pelo WhatsApp
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link to="/">Voltar ao Início</Link>
              </Button>
              <Button asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Falar com Suporte
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default PartnerSuccess;
