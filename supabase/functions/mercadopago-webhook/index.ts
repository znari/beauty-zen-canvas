import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mercadopagoAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mercadopagoAccessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obter dados do webhook
    const body = await req.json();
    console.log(`[MercadoPago Webhook] Recebido:`, JSON.stringify(body, null, 2));

    // Verificar tipo de notificação
    const { type, data, action, topic, resource } = body;

    // CASO 1: Notificação de pagamento direto
    if (type === "payment" || action?.startsWith("payment.")) {
      const paymentId = data?.id;
      if (!paymentId) {
        console.log(`[MercadoPago Webhook] Sem payment ID`);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      console.log(`[MercadoPago Webhook] Processando pagamento direto: ${paymentId}`);
      await processPayment(supabase, mercadopagoAccessToken, paymentId);
    }
    // CASO 2: Notificação de merchant_order (Checkout Pro)
    else if (topic === "merchant_order" && resource) {
      console.log(`[MercadoPago Webhook] Processando merchant_order: ${resource}`);
      await processMerchantOrder(supabase, mercadopagoAccessToken, resource);
    }
    // CASO 3: Outros tipos - ignorar
    else {
      console.log(`[MercadoPago Webhook] Tipo ignorado: ${type || topic || action}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    console.error(`[MercadoPago Webhook] Erro:`, error);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Processar notificação de merchant_order (Checkout Pro)
async function processMerchantOrder(supabase: any, accessToken: string, resourceUrl: string) {
  // Buscar detalhes do merchant_order na API do Mercado Pago
  const orderResponse = await fetch(resourceUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!orderResponse.ok) {
    const errorText = await orderResponse.text();
    console.error(`[MercadoPago Webhook] Erro ao buscar merchant_order:`, errorText);
    throw new Error("Erro ao buscar detalhes do merchant_order");
  }

  const order = await orderResponse.json();
  console.log(`[MercadoPago Webhook] Merchant Order:`, JSON.stringify(order, null, 2));

  const { order_status, external_reference, payments } = order;

  // Verificar se external_reference existe e é do FichaZen
  if (!external_reference || !external_reference.startsWith("fichazen_")) {
    console.log(`[MercadoPago Webhook] External reference inválida: ${external_reference}`);
    return;
  }

  // Verificar se a order foi paga
  if (order_status !== "paid") {
    console.log(`[MercadoPago Webhook] Order não está paga: ${order_status}`);
    return;
  }

  // Encontrar pagamento aprovado
  const approvedPayment = payments?.find((p: any) => p.status === "approved");
  if (!approvedPayment) {
    console.log(`[MercadoPago Webhook] Nenhum pagamento aprovado encontrado`);
    return;
  }

  console.log(`[MercadoPago Webhook] Pagamento aprovado encontrado: ${approvedPayment.id}`);

  // Processar o pagamento aprovado
  await processPayment(supabase, accessToken, approvedPayment.id, external_reference);
}

// Processar pagamento individual
async function processPayment(supabase: any, accessToken: string, paymentId: string | number, knownExternalRef?: string) {
  console.log(`[MercadoPago Webhook] Buscando pagamento: ${paymentId}`);

  // Buscar detalhes do pagamento na API do Mercado Pago
  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!paymentResponse.ok) {
    const errorText = await paymentResponse.text();
    console.error(`[MercadoPago Webhook] Erro ao buscar pagamento:`, errorText);
    throw new Error("Erro ao buscar detalhes do pagamento");
  }

  const payment = await paymentResponse.json();
  console.log(`[MercadoPago Webhook] Pagamento:`, JSON.stringify(payment, null, 2));

  const { status, external_reference: paymentExtRef, status_detail } = payment;
  const external_reference = knownExternalRef || paymentExtRef;

  // Verificar se external_reference existe e é do FichaZen
  if (!external_reference || !external_reference.startsWith("fichazen_")) {
    console.log(`[MercadoPago Webhook] External reference inválida: ${external_reference}`);
    return;
  }

  // Extrair user_id da external_reference (formato: fichazen_userId_timestamp)
  const parts = external_reference.split("_");
  const userId = parts[1];

  console.log(`[MercadoPago Webhook] User ID: ${userId}, Status: ${status}`);

  // Buscar transação pelo external_reference
  const { data: transactions, error: findError } = await supabase
    .from("billing_transactions")
    .select("*")
    .eq("professional_id", userId)
    .eq("payment_gateway", "mercadopago")
    .order("created_at", { ascending: false })
    .limit(5);

  if (findError) {
    console.error(`[MercadoPago Webhook] Erro ao buscar transações:`, findError);
    throw new Error("Erro ao buscar transação");
  }

  // Encontrar a transação correta
  const transaction = transactions?.find((t: any) => {
    const metadata = t.metadata as any;
    return metadata?.external_reference === external_reference;
  });

  if (!transaction) {
    console.log(`[MercadoPago Webhook] Transação não encontrada para: ${external_reference}`);
    return;
  }

  console.log(`[MercadoPago Webhook] Transação encontrada: ${transaction.id}`);

  // Mapear status do Mercado Pago para nosso status
  let newStatus = transaction.status;
  let paidAt = null;

  switch (status) {
    case "approved":
      newStatus = "paid";
      paidAt = new Date().toISOString();
      break;
    case "pending":
    case "in_process":
      newStatus = "pending";
      break;
    case "rejected":
      newStatus = "failed";
      break;
    case "cancelled":
      newStatus = "cancelled";
      break;
    case "refunded":
      newStatus = "refunded";
      break;
    default:
      console.log(`[MercadoPago Webhook] Status desconhecido: ${status}`);
  }

  // Atualizar transação
  const updateData: any = {
    status: newStatus,
    mercadopago_payment_id: String(paymentId),
    metadata: {
      ...transaction.metadata,
      mp_status: status,
      mp_status_detail: status_detail,
      mp_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    },
  };

  if (paidAt) {
    updateData.paid_at = paidAt;
  }

  const { error: updateError } = await supabase
    .from("billing_transactions")
    .update(updateData)
    .eq("id", transaction.id);

  if (updateError) {
    console.error(`[MercadoPago Webhook] Erro ao atualizar transação:`, updateError);
    throw new Error("Erro ao atualizar transação");
  }

  console.log(`[MercadoPago Webhook] Transação atualizada: ${newStatus}`);

  // Se pagamento aprovado, ativar plano
  if (status === "approved") {
    console.log(`[MercadoPago Webhook] Ativando plano para usuário: ${userId}`);

    // Calcular data de expiração (30 dias)
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);

    // Buscar perfil atual
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("subscription_started_at")
      .eq("id", userId)
      .single();

    const profileUpdate: any = {
      plan: transaction.plan_id,
      subscription_status: "active",
      subscription_ends_at: subscriptionEndsAt.toISOString(),
      last_payment_date: paidAt,
      updated_at: new Date().toISOString(),
    };

    // Só atualizar subscription_started_at se for primeiro pagamento
    if (!currentProfile?.subscription_started_at) {
      profileUpdate.subscription_started_at = paidAt;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (profileError) {
      console.error(`[MercadoPago Webhook] Erro ao atualizar perfil:`, profileError);
      throw new Error("Erro ao ativar plano");
    }

    console.log(`[MercadoPago Webhook] Plano ${transaction.plan_id} ativado com sucesso!`);
  }
}
