import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVisitPhotoUrl = (photoPath: string | null) => {
  return useQuery({
    queryKey: ["visit-photo-url", photoPath],
    queryFn: async () => {
      if (!photoPath) return null;

      const { data, error } = await supabase.storage
        .from('visit-photos')
        .createSignedUrl(photoPath, 3600); // 1 hora de validade

      if (error) {
        console.error("Erro ao gerar signed URL:", error);
        return null;
      }

      return data.signedUrl;
    },
    enabled: !!photoPath,
    staleTime: 30 * 60 * 1000, // 30 min cache (metade da validade)
  });
};

// Hook para múltiplas fotos de uma vez
export const useVisitPhotosUrls = (photoPaths: string[]) => {
  return useQuery({
    queryKey: ["visit-photos-urls", photoPaths],
    queryFn: async () => {
      if (photoPaths.length === 0) return {};

      const urlPromises = photoPaths.map(async (path) => {
        const { data, error } = await supabase.storage
          .from('visit-photos')
          .createSignedUrl(path, 3600);

        return { path, url: error ? null : data.signedUrl };
      });

      const results = await Promise.all(urlPromises);
      return Object.fromEntries(results.map(r => [r.path, r.url]));
    },
    enabled: photoPaths.length > 0,
    staleTime: 30 * 60 * 1000,
  });
};
