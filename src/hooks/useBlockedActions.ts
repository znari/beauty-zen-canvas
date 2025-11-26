import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { toast } from "@/hooks/use-toast";

export type BlockedAction = 'create' | 'edit' | 'delete' | 'export';

export const useBlockedActions = () => {
  const { data: subscription, isLoading } = useSubscriptionStatus();

  const checkPermission = (action: BlockedAction): boolean => {
    if (isLoading || !subscription) return true; // Allow during loading
    
    // Se pode modificar, permitir tudo
    if (subscription.canModify) return true;
    
    // Se expirado ou modo somente leitura, bloquear modificações
    if (subscription.isExpired || subscription.canViewOnly) {
      const blockedActions: BlockedAction[] = ['create', 'edit', 'delete', 'export'];
      if (blockedActions.includes(action)) {
        toast({
          title: "🔒 Acesso bloqueado",
          description: "Seu período expirou. Assine um plano para continuar usando esta funcionalidade.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  return {
    checkPermission,
    isBlocked: subscription?.isExpired || subscription?.canViewOnly || false,
    isExpiringToday: subscription?.isExpiringToday || false,
    canModify: subscription?.canModify ?? true,
    canExportPDF: subscription?.canExportPDF ?? true,
    isLoading,
  };
};
