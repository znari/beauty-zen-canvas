import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { celebratePayment } from "@/lib/confetti";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const usePlanActivationDetector = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isWaitingActivation, setIsWaitingActivation] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Verificar se há ativação pendente
    const pending = localStorage.getItem('pendingPlanActivation');
    if (!pending) return;

    // Verificar o estado atual do perfil antes de criar subscrição
    const checkCurrentProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status')
        .eq('id', user.id)
        .single();

      // Se o plano já está ativo, limpar localStorage e não escutar mudanças
      if (profile?.subscription_status === 'active' && profile?.plan !== 'free') {
        console.log('✅ Plano já ativo. Limpando localStorage e invalidando cache.');
        localStorage.removeItem('pendingPlanActivation');
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        setIsWaitingActivation(false);
        return true; // Indica que já está ativo
      }
      
      return false; // Ainda não está ativo
    };

    const setupActivationListener = async () => {
      const isAlreadyActive = await checkCurrentProfile();
      if (isAlreadyActive) return; // Sair sem criar subscrições

      setIsWaitingActivation(true);

      // Subscrever mudanças em tempo real no perfil
      const channel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            const newProfile = payload.new as any;
            
            // Verificar se o plano foi ativado
            if (newProfile.subscription_status === 'active' && 
                newProfile.plan !== 'free') {
              
              // Invalidar cache do subscription status para forçar refetch
              queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
              
              // Disparar notificação de sucesso
              celebratePayment();
              toast.success(
                `🎉 Plano ${newProfile.plan} ativado com sucesso!`,
                {
                  description: 'Você já pode usar todos os recursos do seu plano.',
                  duration: 5000,
                }
              );

              // Limpar pendência
              localStorage.removeItem('pendingPlanActivation');
              setIsWaitingActivation(false);
              
              // Cancelar subscrição
              channel.unsubscribe();
            }
          }
        )
        .subscribe();

      // Timeout de 5 minutos (caso o webhook demore muito)
      const timeout = setTimeout(() => {
        toast.info('Seu pagamento está sendo processado. Você receberá uma confirmação em breve.');
        localStorage.removeItem('pendingPlanActivation');
        setIsWaitingActivation(false);
      }, 5 * 60 * 1000);

      return () => {
        console.log('🧹 Limpando subscrição de ativação');
        channel.unsubscribe();
        clearTimeout(timeout);
      };
    };

    setupActivationListener();
  }, [user]);

  return { isWaitingActivation };
};
