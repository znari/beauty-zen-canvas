import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateProcedureData {
  name: string;
  price: number;
  description?: string;
}

export const useCreateProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProcedureData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: procedure, error } = await supabase
        .from("procedures")
        .insert({
          professional_id: user.id,
          name: data.name,
          price: data.price,
          description: data.description || null,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return procedure;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
    },
  });
};
