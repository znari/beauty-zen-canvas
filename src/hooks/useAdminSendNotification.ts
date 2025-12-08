import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
}

export const useAdminSendNotification = () => {
  return useMutation({
    mutationFn: async ({ userId, title, message }: SendNotificationParams) => {
      const { data, error } = await supabase.rpc('admin_send_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Notificação enviada com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro ao enviar notificação:", error);
      toast.error("Erro ao enviar notificação: " + error.message);
    }
  });
};
