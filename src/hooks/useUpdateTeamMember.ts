import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateTeamMemberData {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  specialty?: string;
  is_active?: boolean;
}

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTeamMemberData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { id, ...updateData } = data;

      const { data: member, error } = await supabase
        .from("team_members")
        .update(updateData)
        .eq("id", id)
        .eq("owner_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Profissional atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar profissional", {
        description: error.message,
      });
    },
  });
};
