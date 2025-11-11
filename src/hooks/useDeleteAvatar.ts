import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (!profile?.avatar_url) {
        throw new Error("Nenhuma foto de perfil para excluir");
      }

      const avatarPath = profile.avatar_url;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase.storage
        .from('profile-avatars')
        .remove([avatarPath]);

      if (deleteError) {
        console.warn("Erro ao deletar arquivo do storage:", deleteError);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["avatar-url"] });
      toast.success("Foto de perfil removida com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao remover foto de perfil");
    },
  });
};
