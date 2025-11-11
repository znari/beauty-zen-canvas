import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      const oldAvatarPath = profile?.avatar_url;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const storagePath = uploadData.path;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: storagePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (oldAvatarPath) {
        try {
          await supabase.storage
            .from('profile-avatars')
            .remove([oldAvatarPath]);
        } catch (error) {
          console.warn("Erro ao deletar avatar antigo:", error);
        }
      }

      return storagePath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto de perfil atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao fazer upload da foto");
    },
  });
};
