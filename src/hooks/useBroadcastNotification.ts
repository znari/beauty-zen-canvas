import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BroadcastParams {
  title: string;
  message: string;
  type?: string;
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: async (params: BroadcastParams) => {
      const { data, error } = await supabase.functions.invoke('admin-broadcast-notification', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Notificação enviada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Broadcast error:', error);
      toast.error(error.message || 'Erro ao enviar notificação');
    }
  });
}
