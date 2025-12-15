import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep('Stripe key verified');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    logStep('Authorization header found');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const { planId, billingPeriod } = await req.json();
    logStep('Request body parsed', { planId, billingPeriod });

    if (!planId || !billingPeriod) {
      throw new Error('planId and billingPeriod are required');
    }

    // Buscar dados do plano
    const { data: planData, error: planError } = await supabase
      .from('plan_definitions')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !planData) {
      throw new Error(`Plan not found: ${planId}`);
    }
    logStep('Plan found', { planId, planName: planData.name });

    // Determinar o price_id baseado no período
    const priceId = billingPeriod === 'yearly' 
      ? planData.stripe_price_id_yearly 
      : planData.stripe_price_id_monthly;

    if (!priceId) {
      throw new Error(`Price ID not configured for plan ${planId} with period ${billingPeriod}`);
    }
    logStep('Price ID determined', { priceId, billingPeriod });

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile not found: ${profileError.message}`);
    }
    logStep('Profile found', { fullName: profile.full_name });

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    // Verificar se já existe customer no Stripe
    let customerId = profile.stripe_customer_id;
    
    if (!customerId) {
      // Procurar por email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep('Existing customer found', { customerId });
      } else {
        // Criar novo customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: profile.full_name || undefined,
          phone: profile.phone_raw || undefined,
          metadata: {
            supabase_user_id: user.id,
            plan_id: planId,
          },
        });
        customerId = customer.id;
        logStep('New customer created', { customerId });
      }

      // Salvar customer_id no profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
      logStep('Customer ID saved to profile');
    }

    // Calcular valor
    const amount = billingPeriod === 'yearly' 
      ? planData.price_yearly 
      : planData.price_monthly;

    // Criar transação pendente no banco
    const { data: transaction, error: transactionError } = await supabase
      .from('billing_transactions')
      .insert({
        professional_id: user.id,
        plan_id: planId,
        amount: amount,
        status: 'pending',
        payment_gateway: 'stripe',
        frequency: billingPeriod === 'yearly' ? 'YEARLY' : 'MONTHLY',
        stripe_customer_id: customerId,
        customer_data: {
          email: user.email,
          name: profile.full_name,
          phone: profile.phone_raw,
        },
        metadata: {
          billing_period: billingPeriod,
          price_id: priceId,
        },
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }
    logStep('Transaction created', { transactionId: transaction.id });

    // URLs de retorno
    const origin = req.headers.get('origin') || 'https://fichazen.com.br';
    const successUrl = `${origin}/dashboard/planos?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/dashboard/planos?payment=cancelled`;

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: user.id,
        transaction_id: transaction.id,
        plan_id: planId,
        billing_period: billingPeriod,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
          billing_period: billingPeriod,
        },
      },
      locale: 'pt-BR',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
    });

    logStep('Checkout session created', { sessionId: session.id, url: session.url });

    // Atualizar transação com session_id
    await supabase
      .from('billing_transactions')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', transaction.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
        transactionId: transaction.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
