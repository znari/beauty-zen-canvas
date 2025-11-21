import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { toast } from "sonner";

type ResourceType = 'client' | 'anamnesis' | 'professional' | 'photo';

export const useCanCreateResource = () => {
  const { data: subscription } = useSubscriptionStatus();

  const canCreate = (type: ResourceType, additionalSizeMB?: number): boolean => {
    if (!subscription) return false;

    // Se em teste ou plano ativo, permitir verificação de limites
    if (subscription.isTrialActive || subscription.status === 'active') {
      const { limits, currentUsage } = subscription;

      switch (type) {
        case 'client':
          if (limits.maxClients !== null && currentUsage.clientsCount >= limits.maxClients) {
            toast.error("Limite de clientes atingido", {
              description: `Seu plano permite até ${limits.maxClients} clientes. Faça upgrade para adicionar mais.`,
            });
            return false;
          }
          break;

        case 'anamnesis':
          if (limits.maxAnamneses !== null && currentUsage.anamnesesCount >= limits.maxAnamneses) {
            toast.error("Limite de fichas atingido", {
              description: `Seu plano permite até ${limits.maxAnamneses} fichas. Faça upgrade para adicionar mais.`,
            });
            return false;
          }
          break;

        case 'professional':
          if (limits.maxProfessionals !== null && currentUsage.professionalsCount >= limits.maxProfessionals) {
            toast.error("Limite de profissionais atingido", {
              description: `Seu plano permite até ${limits.maxProfessionals} profissionais. Faça upgrade para adicionar mais.`,
            });
            return false;
          }
          break;

        case 'photo':
          const storageUsedGB = currentUsage.storageUsedMB / 1024;
          const additionalGB = (additionalSizeMB || 0) / 1024;
          const totalGB = storageUsedGB + additionalGB;
          
          if (limits.maxStorageGB !== null && totalGB >= limits.maxStorageGB) {
            toast.error("Limite de armazenamento atingido", {
              description: `Seu plano permite até ${limits.maxStorageGB}GB. Faça upgrade para adicionar mais fotos.`,
            });
            return false;
          }
          break;
      }

      return true;
    }

    // Se não está em teste nem ativo, bloquear
    toast.error("Assinatura necessária", {
      description: "Você precisa de um plano ativo para usar esta funcionalidade.",
    });
    return false;
  };

  return { canCreate };
};
