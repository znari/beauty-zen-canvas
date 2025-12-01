import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PublicSaveAnamnesisData {
  clientId: string;
  responses: any;
}

export const usePublicSaveAnamnesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PublicSaveAnamnesisData) => {
      // Usar RPC segura ao invés de acesso direto às tabelas
      const { data: result, error } = await supabase
        .rpc('submit_public_anamnesis', {
          p_client_id: data.clientId,
          p_responses: data.responses
        });

      if (error) {
        if (error.message.includes('sem visita agendada')) {
          throw new Error("Visita não encontrada ou já passou");
        }
        throw error;
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["public-client-visit", variables.clientId] });
    }
  });
};
