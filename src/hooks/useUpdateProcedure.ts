import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpdateProcedureData {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export const useUpdateProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProcedureData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: procedure, error } = await supabase
        .from("procedures")
        .update({
          name: data.name,
          price: data.price,
          description: data.description || null,
        })
        .eq("id", id)
        .eq("professional_id", user.id)
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
