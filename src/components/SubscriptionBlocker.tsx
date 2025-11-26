import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, LogOut, Lock, Clock } from "lucide-react";

export const SubscriptionBlocker = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: subscription, isLoading } = useSubscriptionStatus();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return <LoadingSpinner message="Verificando assinatura..." />;
  }

  // No dia da expiração: banner laranja urgente (pode usar, mas mostrar alerta)
  if (subscription?.isExpiringToday) {
    return (
      <div>
        <div className="bg-orange-50 border-b-2 border-orange-400 p-4 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">
                  ⚠️ Seu período expira HOJE!
                </p>
                <p className="text-sm text-orange-700">
                  A partir de amanhã, você não poderá fazer modificações no sistema.
                </p>
              </div>
            </div>
            <Button
              variant="cta"
              size="sm"
              onClick={() => navigate("/configuracoes/perfil?tab=pagamento")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Assinar agora
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Se em teste ativo com poucos dias, mostrar banner amarelo
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

  // Bloqueado: banner vermelho fixo + modo somente leitura
  if (subscription?.isBlocked || subscription?.canViewOnly) {
    return (
      <div>
        <div className="bg-red-50 border-b-4 border-red-500 p-4 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">
                  🔒 Conta em modo somente leitura
                </p>
                <p className="text-sm text-red-700">
                  Seu período expirou. Assine um plano para desbloquear todas as funcionalidades.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="cta"
                size="sm"
                onClick={() => navigate("/configuracoes/perfil?tab=pagamento")}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Desbloquear agora
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-700 hover:text-red-900 hover:bg-red-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Tudo ok, renderizar children
  return <>{children}</>;
};
