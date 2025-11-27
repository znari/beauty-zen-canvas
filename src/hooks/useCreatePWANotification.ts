import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreatePWANotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Check if notification already exists to avoid duplicates
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("professional_id", user.id)
        .eq("type", "pwa_install_reminder")
        .limit(1);

      if (existing && existing.length > 0) {
        return { alreadyExists: true };
      }

      const { error } = await supabase.from("notifications").insert({
        professional_id: user.id,
        type: "pwa_install_reminder",
        title: "📱 Instale o FichaZen no seu celular",
        message: "Acesse suas fichas e agenda direto da tela inicial!",
      });

      if (error) throw error;
      return { alreadyExists: false };
    },
    onSuccess: (data) => {
      if (!data?.alreadyExists) {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
      }
    },
  });
};
