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
  limits: PlanLimits;
  currentUsage: {
    clientsCount: number;
    anamnesesCount: number;
    storageUsedMB: number;
    professionalsCount: number;
  };
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

      // Calcular dias até expiração
      const now = new Date();
      const trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
      const daysUntilExpiry = trialEnd 
        ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const isTrialActive = profile.subscription_status === 'trialing' && daysUntilExpiry > 0;
      const isBlocked = !isTrialActive && 
                        profile.subscription_status !== 'active' &&
                        profile.plan === 'free';

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
        }
      };
    },
    refetchInterval: 60000, // Revalidar a cada minuto
  });
};
