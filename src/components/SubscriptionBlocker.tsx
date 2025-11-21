import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, LogOut } from "lucide-react";

export const SubscriptionBlocker = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: subscription, isLoading } = useSubscriptionStatus();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    // Se bloqueado, redirecionar para página de pagamento
    if (subscription?.isBlocked) {
      navigate("/configuracoes/perfil?tab=pagamento");
    }
  }, [subscription?.isBlocked, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Verificando assinatura..." />;
  }

  // Se em teste ativo, mostrar banner
  if (subscription?.isTrialActive && subscription.daysUntilExpiry <= 7) {
    return (
      <div>
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">
                  Seu teste grátis expira em {subscription.daysUntilExpiry} dia(s)
                </p>
                <p className="text-sm text-yellow-700">
                  Escolha um plano para continuar usando o FichaZen
                </p>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/configuracoes/perfil?tab=pagamento")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ver planos
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Se bloqueado, mostrar página de bloqueio
  if (subscription?.isBlocked) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="absolute top-4 right-4 gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
        
        <Card className="max-w-2xl w-full shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Seu período de teste expirou</CardTitle>
            <CardDescription className="text-base">
              Para continuar usando o FichaZen, escolha um de nossos planos
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você teve 15 dias para testar todas as funcionalidades.
              Agora é hora de escolher o plano ideal para o seu estúdio!
            </p>
            <Button
              variant="cta"
              size="lg"
              onClick={() => navigate("/configuracoes/perfil?tab=pagamento")}
              className="w-full sm:w-auto"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Escolher plano e continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tudo ok, renderizar children
  return <>{children}</>;
};
