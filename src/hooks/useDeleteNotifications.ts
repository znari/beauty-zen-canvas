import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      let query = supabase
        .from("notifications")
        .delete()
        .eq("professional_id", user.id);

      // Se IDs específicos foram fornecidos, deletar apenas esses
      if (notificationIds && notificationIds.length > 0) {
        query = query.in('id', notificationIds);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: (_, notificationIds) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
      
      const message = notificationIds && notificationIds.length > 0
        ? `${notificationIds.length} notificação(ões) deletada(s)`
        : "Todas as notificações foram deletadas";
        
      toast({
        title: "Sucesso",
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao deletar notificações",
        description: error.message,
      });
    },
  });
};
