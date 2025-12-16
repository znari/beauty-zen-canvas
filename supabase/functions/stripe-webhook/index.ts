import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Webhook received');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep('Stripe key verified');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Validar assinatura se webhook secret estiver configurado
    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        logStep('Webhook signature verified');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logStep('Webhook signature verification failed', { 
          errorMessage,
          signatureLength: signature?.length,
          secretLength: webhookSecret?.length,
          secretPrefix: webhookSecret?.substring(0, 10)
        });
        return new Response(
          JSON.stringify({ error: 'Invalid signature', details: errorMessage }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Sem webhook secret configurado, parsear diretamente
      event = JSON.parse(body);
      logStep('Webhook parsed without signature verification');
    }

    logStep('Event received', { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep('Checkout session completed', { 
          sessionId: session.id, 
          customerId: session.customer,
          subscriptionId: session.subscription 
        });

        const userId = session.metadata?.supabase_user_id;
        const transactionId = session.metadata?.transaction_id;
        const planId = session.metadata?.plan_id;
        const billingPeriod = session.metadata?.billing_period;

        if (!userId || !planId) {
          logStep('Missing metadata', { userId, planId });
          break;
        }

        // Calcular data de expiração
        const now = new Date();
        const subscriptionEndDate = new Date(now);
        if (billingPeriod === 'yearly') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }

        // Verificar se usuário já tem assinatura ativa para acumular período
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_ends_at')
          .eq('id', userId)
          .single();

        let finalEndDate = subscriptionEndDate;
        if (currentProfile?.subscription_status === 'active' && currentProfile?.subscription_ends_at) {
          const currentEndDate = new Date(currentProfile.subscription_ends_at);
          if (currentEndDate > now) {
            // Acumular a partir da data de expiração atual
            finalEndDate = new Date(currentEndDate);
            if (billingPeriod === 'yearly') {
              finalEndDate.setFullYear(finalEndDate.getFullYear() + 1);
            } else {
              finalEndDate.setDate(finalEndDate.getDate() + 30);
            }
            logStep('Accumulating subscription period', { 
              currentEnd: currentEndDate.toISOString(), 
              newEnd: finalEndDate.toISOString() 
            });
          }
        }

        // Atualizar perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            plan: planId,
            subscription_status: 'active',
            subscription_started_at: currentProfile?.subscription_status !== 'active' ? now.toISOString() : undefined,
            subscription_ends_at: finalEndDate.toISOString(),
            last_payment_date: now.toISOString(),
            stripe_customer_id: session.customer as string,
          })
          .eq('id', userId);

        if (profileError) {
          logStep('Error updating profile', { error: profileError });
        } else {
          logStep('Profile updated successfully', { 
            userId, 
            plan: planId, 
            endsAt: finalEndDate.toISOString() 
          });
        }

        // Atualizar transação
        if (transactionId) {
          const { error: txError } = await supabase
            .from('billing_transactions')
            .update({
              status: 'paid',
              paid_at: now.toISOString(),
              stripe_subscription_id: session.subscription as string,
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq('id', transactionId);

          if (txError) {
            logStep('Error updating transaction', { error: txError });
          } else {
            logStep('Transaction updated to paid', { transactionId });
          }
        }

        // Criar notificação de ativação
        await supabase
          .from('notifications')
          .insert({
            professional_id: userId,
            type: 'plan_activated',
            title: '🎉 Plano ativado!',
            message: `Seu plano ${planId.charAt(0).toUpperCase() + planId.slice(1)} foi ativado com sucesso!`,
          });

        logStep('Activation notification created');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep('Invoice payment succeeded', { 
          invoiceId: invoice.id, 
          customerId: invoice.customer,
          subscriptionId: invoice.subscription 
        });

        // Buscar usuário pelo customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, plan, subscription_ends_at')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (profile) {
          // Renovação de assinatura
          const now = new Date();
          let newEndDate = new Date(now);
          
          // Verificar se é renovação anual ou mensal pelo valor
          const isYearly = (invoice.amount_paid || 0) > 50000; // > R$500 = anual
          
          if (profile.subscription_ends_at) {
            const currentEnd = new Date(profile.subscription_ends_at);
            if (currentEnd > now) {
              newEndDate = new Date(currentEnd);
            }
          }
          
          if (isYearly) {
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          } else {
            newEndDate.setDate(newEndDate.getDate() + 30);
          }

          await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_ends_at: newEndDate.toISOString(),
              last_payment_date: now.toISOString(),
            })
            .eq('id', profile.id);

          logStep('Subscription renewed', { 
            userId: profile.id, 
            newEndDate: newEndDate.toISOString() 
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep('Invoice payment failed', { invoiceId: invoice.id, customerId: invoice.customer });

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (profile) {
          await supabase
            .from('notifications')
            .insert({
              professional_id: profile.id,
              type: 'payment_failed',
              title: '⚠️ Pagamento falhou',
              message: 'Não conseguimos processar seu pagamento. Por favor, atualize seus dados de pagamento.',
            });

          logStep('Payment failed notification created', { userId: profile.id });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep('Subscription cancelled', { 
          subscriptionId: subscription.id, 
          customerId: subscription.customer 
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'cancelled',
            })
            .eq('id', profile.id);

          await supabase
            .from('notifications')
            .insert({
              professional_id: profile.id,
              type: 'subscription_cancelled',
              title: '📢 Assinatura cancelada',
              message: 'Sua assinatura foi cancelada. Você ainda pode usar os recursos do plano atual até a data de expiração.',
            });

          logStep('Subscription cancelled notification created', { userId: profile.id });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep('Subscription updated', { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        });

        // Buscar usuário pelo customer_id
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('id, plan')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (updatedProfile) {
          const priceId = subscription.items.data[0]?.price.id;
          const cancelAtPeriodEnd = subscription.cancel_at_period_end;
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

          // Buscar plano pelo price_id
          const { data: planDef } = await supabase
            .from('plan_definitions')
            .select('id')
            .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
            .maybeSingle();

          // Determinar novo status
          let newStatus = subscription.status === 'active' ? 'active' : subscription.status;
          if (cancelAtPeriodEnd) {
            newStatus = 'cancelling';
          }

          // Atualizar perfil
          const updateData: any = {
            subscription_status: newStatus,
            subscription_ends_at: currentPeriodEnd.toISOString(),
          };

          // Atualizar plano se mudou
          if (planDef && planDef.id !== updatedProfile.plan) {
            updateData.plan = planDef.id;
            logStep('Plan changed', { from: updatedProfile.plan, to: planDef.id });
          }

          await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', updatedProfile.id);

          logStep('Profile updated with subscription changes', {
            userId: updatedProfile.id,
            newStatus,
            cancelAtPeriodEnd,
            endsAt: currentPeriodEnd.toISOString()
          });

          // Notificar se cancelamento agendado
          if (cancelAtPeriodEnd) {
            const formattedDate = currentPeriodEnd.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });

            await supabase
              .from('notifications')
              .insert({
                professional_id: updatedProfile.id,
                type: 'subscription_cancelling',
                title: '📅 Cancelamento agendado',
                message: `Sua assinatura será encerrada em ${formattedDate}. Você pode reverter a qualquer momento.`,
              });

            logStep('Cancellation scheduled notification created');
          }
        }
        break;
      }

      default:
        logStep('Unhandled event type', { type: event.type });
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
