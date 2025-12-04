import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCanCreateResource } from "./useCanCreateResource";
import { toast } from "sonner";

interface UploadPhotoData {
  visitId: string;
  file: File;
  type: "before" | "after";
}

export const useUploadVisitPhotos = () => {
  const queryClient = useQueryClient();
  const { canCreate } = useCanCreateResource();

  return useMutation({
    mutationFn: async ({ visitId, file, type }: UploadPhotoData) => {
      // Verificar limites de armazenamento
      const fileSizeMB = file.size / (1024 * 1024);
      if (!canCreate('photo', fileSizeMB)) {
        throw new Error("Limite de armazenamento atingido");
      }
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${visitId}/${type}_${Date.now()}.${fileExt}`;

      // Upload para o Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('visit-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Buscar fotos atuais da visita
      const { data: visit, error: fetchError } = await supabase
        .from('visits')
        .select('photos')
        .eq('id', visitId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar array de fotos (salvar apenas o path, não a URL)
      const currentPhotos = (visit.photos as any[]) || [];
      const updatedPhotos = [
        ...currentPhotos,
        {
          path: fileName,
          type: type,
          uploadedAt: new Date().toISOString()
        }
      ];

      // Salvar no banco
      const { error: updateError } = await supabase
        .from('visits')
        .update({ photos: updatedPhotos })
        .eq('id', visitId);

      if (updateError) throw updateError;

      return { path: fileName };
    },
    onSuccess: (_, variables) => {
      // Invalidar cache do perfil do cliente
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    },
    onError: (error: Error) => {
      if (error.message !== "Limite de armazenamento atingido") {
        toast.error("Erro ao fazer upload da foto", {
          description: error.message,
        });
      }
    }
  });
};

export const useDeleteVisitPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, photoPath }: { visitId: string; photoPath: string }) => {
      // Deletar do Storage
      const { error: deleteError } = await supabase.storage
        .from('visit-photos')
        .remove([photoPath]);

      if (deleteError) throw deleteError;

      // Buscar fotos atuais
      const { data: visit, error: fetchError } = await supabase
        .from('visits')
        .select('photos')
        .eq('id', visitId)
        .single();

      if (fetchError) throw fetchError;

      // Remover foto do array
      const currentPhotos = (visit.photos as any[]) || [];
      const updatedPhotos = currentPhotos.filter((photo: any) => photo.path !== photoPath);

      // Atualizar banco
      const { error: updateError } = await supabase
        .from('visits')
        .update({ photos: updatedPhotos })
        .eq('id', visitId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
    }
  });
};
