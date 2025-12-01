import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, RefreshCcw, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Verificar se há email pendente no localStorage
    const pendingEmail = localStorage.getItem('pendingConfirmationEmail');
    
    if (!pendingEmail) {
      // Se não há email pendente, redirecionar para registro
      navigate("/registro");
      return;
    }
    
    setEmail(pendingEmail);

    // Detectar confirmação de email automaticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          // Limpar localStorage
          localStorage.removeItem('pendingConfirmationEmail');
          
          // Redirecionar para página de sucesso
          navigate('/sucesso?origem=cadastro');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Cooldown timer para reenvio
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const getEmailProviderUrl = (emailAddress: string) => {
    const domain = emailAddress.split('@')[1]?.toLowerCase();
    const providers: Record<string, string> = {
      'gmail.com': 'https://mail.google.com',
      'googlemail.com': 'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'live.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'yahoo.com.br': 'https://mail.yahoo.com',
      'icloud.com': 'https://www.icloud.com/mail',
    };
    return providers[domain] || `https://${domain}`;
  };

  const handleResendEmail = async () => {
    if (cooldown > 0) return;

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast({
        title: "E-mail reenviado! ✅",
        description: "Verifique sua caixa de entrada novamente.",
      });

      // Iniciar cooldown de 60 segundos
      setCooldown(60);
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar e-mail",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegistration = () => {
    localStorage.removeItem('pendingConfirmationEmail');
    navigate('/registro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center">
          {/* Animação do envelope */}
          <div className="mb-6 relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full animate-pulse">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full animate-bounce" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Quase lá! 📧
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Verifique seu e-mail para confirmar o cadastro
          </p>

          {/* Card de instruções */}
          <Card className="bg-muted/50 p-6 mb-6 text-left">
            <p className="text-sm text-foreground mb-4">
              Enviamos um link de confirmação para{" "}
              <span className="font-semibold text-primary">{email}</span>
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">💡</span>
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Dicas importantes:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Verifique a pasta de <strong>spam ou lixeira</strong></li>
                    <li>Procure por e-mail de <strong>noreply@fichazen.com.br</strong></li>
                    <li>O link expira em <strong>24 horas</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Botão abrir email */}
          <Button
            variant="cta"
            size="lg"
            className="w-full mb-3"
            onClick={() => window.open(getEmailProviderUrl(email), '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir meu e-mail
          </Button>

          {/* Botão reenviar */}
          <Button
            variant="outline"
            size="lg"
            className="w-full mb-6"
            onClick={handleResendEmail}
            disabled={isResending || cooldown > 0}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
            {isResending 
              ? "Reenviando..." 
              : cooldown > 0 
                ? `Aguarde ${cooldown}s` 
                : "Não recebeu? Reenviar e-mail"}
          </Button>

          {/* Link voltar */}
          <button
            onClick={handleBackToRegistration}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Cadastrou com e-mail errado? Voltar
          </button>

          {/* Indicador de verificação em tempo real */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Aguardando confirmação...
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
