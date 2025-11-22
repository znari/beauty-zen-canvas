import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { celebratePayment } from "@/lib/confetti";
import { toast } from "sonner";

export const usePlanActivationDetector = () => {
  const { user } = useAuth();
  const [isWaitingActivation, setIsWaitingActivation] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Verificar se há ativação pendente
    const pending = localStorage.getItem('pendingPlanActivation');
    if (!pending) return;

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
      if (isWaitingActivation) {
        toast.info('Seu pagamento está sendo processado. Você receberá uma confirmação em breve.');
        localStorage.removeItem('pendingPlanActivation');
        setIsWaitingActivation(false);
      }
    }, 5 * 60 * 1000);

    return () => {
      channel.unsubscribe();
      clearTimeout(timeout);
    };
  }, [user, isWaitingActivation]);

  return { isWaitingActivation };
};
