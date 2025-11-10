import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error("Formato inválido. Use JPG, PNG ou WEBP");
      }

      // Validar tamanho (máximo 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error("Arquivo muito grande. Tamanho máximo: 2MB");
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // 1. Buscar avatar atual para deletar depois
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      const oldAvatarUrl = profile?.avatar_url;

      // 2. Upload do novo arquivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Obter URL pública
      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(uploadData.path);

      const publicUrl = urlData.publicUrl;

      // 4. Atualizar perfil com nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 5. Deletar avatar antigo se existir
      if (oldAvatarUrl) {
        try {
          const oldPath = oldAvatarUrl.split('/profile-avatars/')[1];
          if (oldPath) {
            await supabase.storage
              .from('profile-avatars')
              .remove([oldPath]);
          }
        } catch (error) {
          console.warn("Erro ao deletar avatar antigo:", error);
          // Não falhar a operação se não conseguir deletar o antigo
        }
      }

      return publicUrl;
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
