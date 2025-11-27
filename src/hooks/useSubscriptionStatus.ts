import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlanLimits {
  maxClients: number | null;
  maxAnamneses: number | null;
  maxStorageGB: number | null;
  maxProfessionals: number | null;
}

export interface SubscriptionStatus {
  plan: string;
  status: 'trialing' | 'active' | 'cancelled' | 'expired' | 'payment_required';
  trialEndsAt: string | null;
  isTrialActive: boolean;
  isBlocked: boolean;
  daysUntilExpiry: number;
  lastPaymentDate: string | null;
  subscriptionEndsAt: string | null;
  subscriptionStartedAt: string | null;
  daysUntilRenewal: number;
  isNearExpiry: boolean;
  limits: PlanLimits;
  currentUsage: {
    clientsCount: number;
    anamnesesCount: number;
    storageUsedMB: number;
    professionalsCount: number;
  };
  // Novos campos para controle granular
  isExpiringToday: boolean;
  isExpired: boolean;
  canModify: boolean;
  canExportPDF: boolean;
  canViewOnly: boolean;
}

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar definição do plano
      const { data: planDef } = await supabase
        .from("plan_definitions")
        .select("*")
        .eq("id", profile.plan || 'free')
        .maybeSingle();

      const now = new Date();
      
      // Calcular data de expiração baseada no status
      const trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
      const subscriptionEnd = profile.subscription_ends_at 
        ? new Date(profile.subscription_ends_at) 
        : null;

      // Determinar qual data usar para expiração
      const isTrialing = profile.subscription_status === 'trialing';
      const expiryDate = isTrialing ? trialEnd : subscriptionEnd;

      // Calcular dias até expiração
      const daysUntilExpiry = expiryDate 
        ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Status detalhados
      const isExpiringToday = daysUntilExpiry === 0;
      const isExpired = daysUntilExpiry < 0;
      
      const isTrialActive = isTrialing && daysUntilExpiry > 0;
      const isSubscriptionActive = profile.subscription_status === 'active' && !isExpired;

      // Determinar se está bloqueado
      // Bloqueado se: trial expirou OU subscription expirou E não tem plano ativo
      const isBlocked = isExpired && profile.subscription_status !== 'active';

      // Permissões granulares
      const canModify = isTrialActive || isSubscriptionActive || isExpiringToday;
      const canExportPDF = canModify;
      const canViewOnly = isBlocked;

      // Calcular dias até renovação (para assinaturas ativas)
      const daysUntilRenewal = subscriptionEnd && !isTrialing
        ? Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const isNearExpiry = daysUntilRenewal > 0 && daysUntilRenewal <= 5;

      // Contar uso atual
      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", user.id);

      const { count: anamnesesCount } = await supabase
        .from("anamneses")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", user.id);

      const status = (profile.subscription_status || 'trialing') as 'trialing' | 'active' | 'cancelled' | 'expired' | 'payment_required';

      return {
        plan: profile.plan || 'free',
        status,
        trialEndsAt: profile.trial_ends_at,
        isTrialActive,
        isBlocked,
        daysUntilExpiry,
        lastPaymentDate: profile.last_payment_date,
        subscriptionEndsAt: profile.subscription_ends_at,
        subscriptionStartedAt: profile.subscription_started_at,
        daysUntilRenewal,
        isNearExpiry,
        limits: {
          maxClients: planDef?.max_clients || null,
          maxAnamneses: planDef?.max_anamneses || null,
          maxStorageGB: planDef?.max_storage_gb || null,
          maxProfessionals: planDef?.max_professionals || null,
        },
        currentUsage: {
          clientsCount: clientsCount || 0,
          anamnesesCount: anamnesesCount || 0,
          storageUsedMB: profile.storage_used_mb || 0,
          professionalsCount: profile.professionals_count || 1,
        },
        // Novos campos
        isExpiringToday,
        isExpired,
        canModify,
        canExportPDF,
        canViewOnly,
      };
    },
    staleTime: Infinity, // Dados nunca ficam "stale" automaticamente
    gcTime: 1000 * 60 * 60 * 24, // Manter em cache por 24 horas
    refetchOnWindowFocus: false, // Não refetch ao focar janela
    refetchOnMount: false, // Não refetch ao montar componente
    refetchOnReconnect: false, // Não refetch ao reconectar
  });
};
