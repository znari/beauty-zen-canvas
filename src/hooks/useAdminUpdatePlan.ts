import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdatePlanParams {
  userId: string;
  plan: string;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
}

export const useAdminUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, plan, subscriptionStatus, subscriptionEndsAt }: UpdatePlanParams) => {
      const { data, error } = await supabase.rpc('admin_update_user_plan', {
        p_user_id: userId,
        p_plan: plan,
        p_subscription_status: subscriptionStatus,
        p_subscription_ends_at: subscriptionEndsAt
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-users-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details"] });
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar plano:", error);
      toast.error("Erro ao atualizar plano: " + error.message);
    }
  });
};
