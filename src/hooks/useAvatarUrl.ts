import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAvatarUrl = (avatarPath: string | null) => {
  return useQuery({
    queryKey: ["avatar-url", avatarPath],
    queryFn: async () => {
      if (!avatarPath) return null;

      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .createSignedUrl(avatarPath, 3600);

      if (error) {
        console.error("Erro ao gerar signed URL:", error);
        return null;
      }

      return data.signedUrl;
    },
    enabled: !!avatarPath,
    staleTime: 30 * 60 * 1000,
  });
};
