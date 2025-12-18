import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PartnerRegistrationData {
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  isFichaZenClient: boolean;
  message?: string;
}

// Generate a temporary referral code (will be replaced on approval)
const generateTempCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TEMP_';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Send confirmation email via edge function
const sendConfirmationEmail = async (name: string, email: string) => {
  try {
    const { error } = await supabase.functions.invoke('send-partner-confirmation', {
      body: { name, email },
    });
    
    if (error) {
      console.error('Failed to send confirmation email:', error);
    } else {
      console.log('Confirmation email sent successfully');
    }
  } catch (err) {
    console.error('Error sending confirmation email:', err);
  }
};

export const usePartnerRegistration = () => {
  return useMutation({
    mutationFn: async (data: PartnerRegistrationData) => {
      // Check if email already registered
      const { data: existing } = await supabase
        .from('partners')
        .select('id, status')
        .eq('email', data.email)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'pending') {
          throw new Error('Este email já possui uma solicitação pendente');
        } else if (existing.status === 'active') {
          throw new Error('Este email já é um parceiro ativo');
        } else if (existing.status === 'rejected') {
          throw new Error('Este email foi rejeitado anteriormente');
        }
      }

      // Get user_id if logged in
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Insert new partner
      const { data: partner, error } = await supabase
        .from('partners')
        .insert({
          user_id: userId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          pix_key: data.pixKey,
          pix_key_type: data.pixKeyType,
          referral_code: generateTempCode(),
          notes: data.message || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email (non-blocking)
      sendConfirmationEmail(data.name, data.email);

      return partner;
    },
    onSuccess: () => {
      toast.success('Solicitação enviada! Você receberá um email de confirmação.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar solicitação');
    },
  });
};
