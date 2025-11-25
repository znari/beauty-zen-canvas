import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Verificar se não é o owner
      const { data: member, error: checkError } = await supabase
        .from("team_members")
        .select("is_owner")
        .eq("id", memberId)
        .single();

      if (checkError) throw checkError;
      if (member?.is_owner) {
        throw new Error("Não é possível excluir o proprietário da conta");
      }

      // Excluir membro
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId)
        .eq("owner_id", user.id);

      if (error) throw error;

      // Atualizar contador de profissionais
      const { count } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      await supabase
        .from("profiles")
        .update({ professionals_count: count || 1 })
        .eq("id", user.id);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      toast.success("Profissional removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover profissional", {
        description: error.message,
      });
    },
  });
};
