import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerConfirmationRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: PartnerConfirmationRequest = await req.json();

    console.log(`Sending partner confirmation email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "FichaZen <noreply@mail.fichazen.com.br>",
      to: [email],
      subject: "🎉 FichaZen - Recebemos sua solicitação de parceria!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Solicitação Recebida!</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin: 0 0 20px;">
                Olá <strong>${name}</strong>!
              </p>
              
              <p style="font-size: 16px; color: #6B7280; line-height: 1.6; margin: 0 0 30px;">
                Recebemos sua solicitação para fazer parte do <strong>Programa de Parceiros FichaZen</strong>. Estamos muito felizes com seu interesse!
              </p>
              
              <!-- Timeline -->
              <div style="background-color: #F3F4F6; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h2 style="font-size: 16px; color: #374151; margin: 0 0 20px; font-weight: 600;">📋 Próximos Passos</h2>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="width: 24px; height: 24px; background-color: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <span style="color: white; font-size: 12px;">✓</span>
                  </div>
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">Cadastro recebido</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #6B7280;">Sua solicitação está em nossa fila</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="width: 24px; height: 24px; background-color: #F59E0B; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <span style="color: white; font-size: 12px;">⏳</span>
                  </div>
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">Análise em andamento</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #6B7280;">Prazo: até 48 horas úteis</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="width: 24px; height: 24px; background-color: #9CA3AF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <span style="color: white; font-size: 12px;">📧</span>
                  </div>
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">Notificação por email</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #6B7280;">Você receberá o resultado aqui</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start;">
                  <div style="width: 24px; height: 24px; background-color: #9CA3AF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <span style="color: white; font-size: 12px;">🚀</span>
                  </div>
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">Acesso ao dashboard</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #6B7280;">Após aprovação, seu link estará disponível</p>
                  </div>
                </div>
              </div>
              
              <!-- Commission Info -->
              <div style="background: linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #8B5CF6;">
                <p style="margin: 0; font-size: 14px; color: #6B21A8;">
                  💰 <strong>Comissão:</strong> R$ 20,00 por cliente indicado que realizar o primeiro pagamento
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0;">
                Enquanto aguarda, conheça mais sobre o FichaZen em <a href="https://fichazen.com.br" style="color: #8B5CF6; text-decoration: none;">fichazen.com.br</a>
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
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-partner-confirmation function:", error);
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
