import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Clock, CheckCircle2, HelpCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUPPORT_WHATSAPP, SUPPORT_EMAIL, SUPPORT_HOURS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Support = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Olá! Preciso de ajuda com o FichaZen.");
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${message}`, "_blank");
  };

  const handleEmailContact = () => {
    window.open(`mailto:${SUPPORT_EMAIL}?subject=Suporte FichaZen`, "_blank");
  };

  const handleBack = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  // Content shared between both layouts
  const SupportContent = () => (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Status do Sistema */}
      <Card className="mb-6 border-green-200 bg-green-50/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Sistema Operacional</p>
              <p className="text-sm text-green-600">Todos os serviços funcionando normalmente</p>
            </div>
            <Badge variant="active" className="ml-auto">Online</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Canais de Contato */}
      <h2 className="text-lg font-semibold text-secondary mb-4">Canais de Atendimento</h2>
      
      <div className="grid gap-4 mb-8">
        {/* WhatsApp - Principal */}
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
                <CardDescription>Atendimento mais rápido</CardDescription>
              </div>
              <Badge className="ml-auto bg-primary/10 text-primary border-0">Recomendado</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Envie sua dúvida pelo WhatsApp e receba resposta em até 2 horas durante o horário comercial.
            </p>
            <Button onClick={handleWhatsAppContact} className="w-full sm:w-auto">
              <MessageCircle className="h-4 w-4 mr-2" />
              Iniciar Conversa
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* E-mail */}
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">E-mail</CardTitle>
                <CardDescription>Para questões detalhadas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Envie um e-mail detalhado para questões mais complexas. Respondemos em até 24 horas úteis.
            </p>
            <Button variant="outline" onClick={handleEmailContact} className="w-full sm:w-auto">
              <Mail className="h-4 w-4 mr-2" />
              Enviar E-mail
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">{SUPPORT_EMAIL}</p>
          </CardContent>
        </Card>

        {/* Horário de Atendimento */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Horário de Atendimento</CardTitle>
                <CardDescription>Quando estamos disponíveis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="text-muted-foreground">{SUPPORT_HOURS.weekdays}</span>
                <span className="font-medium text-secondary">{SUPPORT_HOURS.time}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Sábado, Domingo e Feriados</span>
                <span className="text-muted-foreground">Fechado</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Mensagens fora do horário serão respondidas no próximo dia útil.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Link para Ajuda - only show for logged in users */}
      {isLoggedIn && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="p-3 bg-primary/10 rounded-xl">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary mb-1">Você pode resolver sozinho(a)!</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa Central de Ajuda tem tutoriais completos para todas as funcionalidades.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/ajuda")} className="shrink-0">
                <HelpCircle className="h-4 w-4 mr-2" />
                Ver Tutoriais
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA for non-logged in users */}
      {!isLoggedIn && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="p-3 bg-primary/10 rounded-xl">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary mb-1">Quer conhecer o FichaZen?</h3>
                <p className="text-sm text-muted-foreground">
                  Comece seu teste grátis de 7 dias e transforme sua gestão.
                </p>
              </div>
              <Button onClick={() => navigate("/registro")} className="shrink-0">
                Começar Grátis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );

  // Layout for logged-in users (dashboard style)
  if (isLoggedIn) {
    return (
      <div className="min-h-screen gradient-hero">
        <header className="bg-white/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Suporte</h1>
              <p className="text-sm text-muted-foreground">Estamos aqui para ajudar</p>
            </div>
          </div>
        </header>

        <SupportContent />

        <div className="mt-8 text-center text-sm text-muted-foreground pb-8">
          <p>FichaZen - Sistema de Gestão para Profissionais de Estética</p>
          <p className="mt-1">© {new Date().getFullYear()} Todos os direitos reservados</p>
        </div>
      </div>
    );
  }

  // Layout for visitors (landing page style)
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      
      <div className="flex-1 gradient-hero pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-2">Suporte</h1>
            <p className="text-muted-foreground">Estamos aqui para ajudar você</p>
          </div>
        </div>
        
        <SupportContent />
      </div>

      <LandingFooter />
    </div>
  );
};

export default Support;
