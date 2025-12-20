import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerStatusRequest {
  name: string;
  email: string;
  status: 'approved' | 'rejected';
  referralCode?: string;
  rejectionReason?: string;
}

const getApprovalEmail = (name: string, referralCode: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Parabéns, você foi aprovado!</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #374151; margin: 0 0 20px;">
        Olá <strong>${name}</strong>!
      </p>
      
      <p style="font-size: 16px; color: #6B7280; line-height: 1.6; margin: 0 0 30px;">
        Temos uma ótima notícia! Sua solicitação para fazer parte do <strong>Programa de Parceiros FichaZen</strong> foi <span style="color: #10B981; font-weight: 600;">APROVADA</span>! 🚀
      </p>
      
      <!-- Referral Code Box -->
      <div style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center; border: 2px solid #10B981;">
        <p style="margin: 0 0 10px; font-size: 14px; color: #065F46; font-weight: 500;">Seu código de indicação exclusivo:</p>
        <p style="margin: 0; font-size: 32px; font-weight: 700; color: #047857; letter-spacing: 4px;">${referralCode}</p>
      </div>
      
      <!-- Login Instructions -->
      <div style="background-color: #EDE9FE; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #8B5CF6;">
        <h3 style="margin: 0 0 10px; font-size: 16px; color: #5B21B6; font-weight: 600;">🔐 Como acessar seu dashboard</h3>
        <p style="margin: 0; font-size: 14px; color: #6D28D9; line-height: 1.5;">
          Acesse com o <strong>email e senha</strong> que você cadastrou no momento da solicitação. 
          Clique no botão abaixo para fazer login e começar a indicar!
        </p>
      </div>
      
      <!-- How it works -->
      <div style="background-color: #F3F4F6; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h2 style="font-size: 16px; color: #374151; margin: 0 0 20px; font-weight: 600;">🚀 Como começar a indicar</h2>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px; color: #374151;">
            <strong>1.</strong> Compartilhe seu link de indicação:
          </p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #8B5CF6; word-break: break-all;">
            https://fichazen.com.br/r/${referralCode}
          </p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px; color: #374151;">
            <strong>2.</strong> Quando alguém se cadastrar usando seu link e fizer o primeiro pagamento, você ganha R$ 20,00
          </p>
        </div>
        
        <div>
          <p style="margin: 0; font-size: 14px; color: #374151;">
            <strong>3.</strong> Acompanhe suas indicações e saldo no dashboard de parceiro
          </p>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="https://fichazen.com.br/login" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 16px; font-weight: 600;">
          Fazer Login e Acessar Dashboard
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0; text-align: center;">
        Boas indicações! 💜
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 25px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #6B7280;">
        Dúvidas? Fale conosco pelo WhatsApp
      </p>
      <a href="https://wa.me/556593376413" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
        💬 WhatsApp
      </a>
      <p style="margin: 20px 0 0; font-size: 12px; color: #9CA3AF;">
        © ${new Date().getFullYear()} FichaZen. Todos os direitos reservados.
      </p>
    </div>
    
  </div>
</body>
</html>
`;

const getRejectionEmail = (name: string, reason: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Atualização sobre sua solicitação</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #374151; margin: 0 0 20px;">
        Olá <strong>${name}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #6B7280; line-height: 1.6; margin: 0 0 30px;">
        Agradecemos seu interesse no <strong>Programa de Parceiros FichaZen</strong>. Após análise cuidadosa, infelizmente não pudemos aprovar sua solicitação neste momento.
      </p>
      
      <!-- Reason Box -->
      <div style="background-color: #FEF2F2; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #EF4444;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #991B1B; font-weight: 500;">Motivo:</p>
        <p style="margin: 0; font-size: 14px; color: #7F1D1D;">${reason || 'Não informado'}</p>
      </div>
      
      <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0 0 20px;">
        Isso não significa que você não possa se candidatar novamente no futuro. Se tiver dúvidas ou acredita que houve um engano, entre em contato conosco.
      </p>
      
      <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0;">
        Enquanto isso, convidamos você a conhecer o FichaZen como usuário! Temos um período de teste gratuito de 15 dias.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 25px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #6B7280;">
        Dúvidas? Fale conosco pelo WhatsApp
      </p>
      <a href="https://wa.me/556593376413" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
        💬 WhatsApp
      </a>
      <p style="margin: 20px 0 0; font-size: 12px; color: #9CA3AF;">
        © ${new Date().getFullYear()} FichaZen. Todos os direitos reservados.
      </p>
    </div>
    
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, status, referralCode, rejectionReason }: PartnerStatusRequest = await req.json();

    console.log(`Sending partner ${status} email to: ${email}`);

    let subject: string;
    let html: string;

    if (status === 'approved') {
      subject = "🎉 FichaZen - Você foi aprovado como parceiro!";
      html = getApprovalEmail(name, referralCode || '');
    } else {
      subject = "FichaZen - Atualização sobre sua solicitação de parceria";
      html = getRejectionEmail(name, rejectionReason || '');
    }

    const emailResponse = await resend.emails.send({
      from: "FichaZen <noreply@mail.fichazen.com.br>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-partner-status-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);