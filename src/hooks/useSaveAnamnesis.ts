import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SaveAnamnesisData {
  clientId: string;
  responses: any;
  dataNascimento: string;
  consent: boolean;
}

export const useSaveAnamnesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveAnamnesisData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      
      // Verificar se já existe anamnese para este cliente
      const { data: existing } = await supabase
        .from("anamneses")
        .select("id")
        .eq("client_id", data.clientId)
        .eq("professional_id", user.id)
        .maybeSingle();

      if (existing) {
        // Atualizar anamnese existente
        const { error } = await supabase
          .from("anamneses")
          .update({
            responses: data.responses,
            data_nascimento: data.dataNascimento,
            consent: data.consent,
            filled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Criar nova anamnese
        const { error } = await supabase
          .from("anamneses")
          .insert({
            professional_id: user.id,
            client_id: data.clientId,
            responses: data.responses,
            data_nascimento: data.dataNascimento,
            consent: data.consent,
            filled_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }

      // Atualizar date_of_birth do cliente se fornecido
      if (data.dataNascimento) {
        await supabase
          .from("clients")
          .update({ date_of_birth: data.dataNascimento })
          .eq("id", data.clientId)
          .eq("professional_id", user.id);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ["client-anamnesis", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-profile", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });
};
