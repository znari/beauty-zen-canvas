import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCanCreateResource } from "./useCanCreateResource";
import { toast } from "sonner";

interface CreateTeamMemberData {
  name: string;
  phone?: string;
  email?: string;
  specialty?: string;
  is_active?: boolean;
}

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  const { canCreate } = useCanCreateResource();

  return useMutation({
    mutationFn: async (data: CreateTeamMemberData) => {
      // Verificar limites de profissionais
      if (!canCreate('professional')) {
        throw new Error("Limite de profissionais atingido");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: member, error } = await supabase
        .from("team_members")
        .insert({
          owner_id: user.id,
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          specialty: data.specialty || null,
          is_active: data.is_active ?? true,
          is_owner: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar contador de profissionais no perfil
      const { count } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      await supabase
        .from("profiles")
        .update({ professionals_count: count || 1 })
        .eq("id", user.id);

      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      toast.success("Profissional adicionado com sucesso!");
    },
    onError: (error: Error) => {
      if (error.message !== "Limite de profissionais atingido") {
        toast.error("Erro ao adicionar profissional", {
          description: error.message,
        });
      }
    },
  });
};
