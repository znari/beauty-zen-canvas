import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PublicSaveAnamnesisData {
  clientId: string;
  responses: any;
  anamnesisId?: string;
}

export const usePublicSaveAnamnesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PublicSaveAnamnesisData) => {
      // Buscar o professional_id da próxima visita do cliente
      const { data: visit } = await supabase
        .from("visits")
        .select("professional_id")
        .eq("client_id", data.clientId)
        .gte("visit_date", new Date().toISOString().split('T')[0])
        .eq("status", "scheduled")
        .order("visit_date", { ascending: true })
        .order("visit_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!visit) throw new Error("Visita não encontrada");

      if (data.anamnesisId) {
        // Atualizar anamnese existente
        const { error } = await supabase
          .from("anamneses")
          .update({
            responses: data.responses,
            consent: true,
            filled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", data.anamnesisId);
        
        if (error) throw error;
      } else {
        // Criar nova anamnese
        const { error } = await supabase
          .from("anamneses")
          .insert({
            professional_id: visit.professional_id,
            client_id: data.clientId,
            responses: data.responses,
            consent: true,
            filled_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["public-client-visit", variables.clientId] });
    }
  });
};
