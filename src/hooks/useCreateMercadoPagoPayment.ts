import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateMercadoPagoPaymentParams {
  planId: string;
}

interface CreateMercadoPagoPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  preferenceId?: string;
  transactionId?: string;
  error?: string;
}

export const useCreateMercadoPagoPayment = () => {
  return useMutation({
    mutationFn: async ({ planId }: CreateMercadoPagoPaymentParams): Promise<CreateMercadoPagoPaymentResponse> => {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar logado");
      }

      // Chamar Edge Function
      const response = await fetch(
        `https://ldjgujvxbkclpijtgsdm.supabase.co/functions/v1/create-mercadopago-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ planId })
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pagamento');
      }

      return result;
    },
    onError: (error: any) => {
      console.error('Erro ao criar pagamento Mercado Pago:', error);
      
      // Mensagens de erro personalizadas
      if (error.message.includes('CPF/CNPJ')) {
        toast.error("Por favor, complete seu perfil com CPF/CNPJ antes de assinar");
      } else if (error.message.includes('Dados incompletos')) {
        toast.error("Complete seu perfil antes de assinar um plano");
      } else {
        toast.error(`Erro: ${error.message}`);
      }
    }
  });
};
