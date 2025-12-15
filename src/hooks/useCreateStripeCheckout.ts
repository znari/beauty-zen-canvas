import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateStripeCheckoutParams {
  planId: string;
  billingPeriod: 'monthly' | 'yearly';
}

interface CreateStripeCheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  transactionId?: string;
  error?: string;
}

export const useCreateStripeCheckout = () => {
  return useMutation({
    mutationFn: async ({ planId, billingPeriod }: CreateStripeCheckoutParams): Promise<CreateStripeCheckoutResponse> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar logado");
      }

      const response = await fetch(
        `https://ldjgujvxbkclpijtgsdm.supabase.co/functions/v1/create-stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ planId, billingPeriod })
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar checkout');
      }

      return result;
    },
    onError: (error: any) => {
      console.error('Erro ao criar checkout Stripe:', error);
      toast.error(`Erro: ${error.message}`);
    }
  });
};
