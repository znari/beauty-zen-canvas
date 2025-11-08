import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDeleteProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (procedureId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("procedures")
        .delete()
        .eq("id", procedureId)
        .eq("professional_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
    },
  });
};
