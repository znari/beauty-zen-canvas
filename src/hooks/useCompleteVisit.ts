import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCompleteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // ✨ Verificar se é a primeira visita completada
      const { count } = await supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.id)
        .eq("status", "completed");

      const isFirstCompletion = count === 0;

      // Marcar como completada
      const { error } = await supabase
        .from("visits")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", visitId);

      if (error) throw error;
      
      return { isFirstCompletion };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};
