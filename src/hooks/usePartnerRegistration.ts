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
  password?: string;
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
      // Check if email already registered using RPC (bypasses RLS)
      const { data: emailCheck, error: checkError } = await supabase
        .rpc('check_partner_email_exists', { p_email: data.email })
        .maybeSingle();

      if (checkError) {
        console.error('Error checking email:', checkError);
        throw new Error('Erro ao verificar email');
      }

      if (emailCheck?.email_exists) {
        if (emailCheck.email_status === 'pending') {
          throw new Error('Este email já possui uma solicitação pendente');
        } else if (emailCheck.email_status === 'active') {
          throw new Error('Este email já é um parceiro ativo');
        } else if (emailCheck.email_status === 'rejected') {
          throw new Error('Este email foi rejeitado anteriormente');
        } else if (emailCheck.email_status === 'suspended') {
          throw new Error('Este email está suspenso');
        }
      }

      let userId: string | null = null;

      if (data.isFichaZenClient) {
        // User claims to be an existing client - validate by signing in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password || '',
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Email ou senha incorretos. Verifique suas credenciais FichaZen.');
          }
          throw new Error('Erro ao validar conta. Tente novamente.');
        }

        userId = signInData.user?.id || null;
      } else {
        // New user - create account
        if (!data.password) {
          throw new Error('Senha é obrigatória');
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/parceiro/dashboard`,
            data: {
              full_name: data.name,
              is_partner_signup: true,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            throw new Error('Este email já está cadastrado. Marque a opção "Já sou cliente FichaZen" e confirme sua senha.');
          }
          console.error('SignUp error:', signUpError);
          throw new Error('Erro ao criar conta. Tente novamente.');
        }

        userId = signUpData.user?.id || null;
      }

      // Insert new partner (without .select() to avoid RLS issues)
      const { error } = await supabase
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
        });

      if (error) throw error;

      // Send confirmation email (non-blocking)
      sendConfirmationEmail(data.name, data.email);

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Solicitação enviada! Você receberá um email de confirmação.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar solicitação');
    },
  });
};