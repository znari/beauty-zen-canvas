import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RejectParams {
  requestId: string;
  reason: string;
}

export function useRejectBookingRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RejectParams) => {
      const { error } = await supabase
        .from("booking_requests")
        .update({
          status: "rejected",
          rejection_reason: params.reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", params.requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Solicitação rejeitada",
        description: "O cliente foi notificado sobre a rejeição.",
      });
      queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-booking-requests-count"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
