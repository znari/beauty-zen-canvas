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

    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar JWT e obter usuário
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Token inválido");
    }

    // Obter planId e billingPeriod do body
    const { planId, billingPeriod = 'monthly' } = await req.json();
    if (!planId) {
      throw new Error("planId é obrigatório");
    }

    console.log(`[MercadoPago] Criando pagamento para usuário ${user.id}, plano ${planId}, período ${billingPeriod}`);

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Perfil não encontrado");
    }

    // Validar dados do perfil
    if (!profile.full_name || !profile.email) {
      throw new Error("Dados incompletos no perfil. Preencha nome e email.");
    }

    // Buscar definição do plano
    const { data: planDef, error: planError } = await supabase
      .from("plan_definitions")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !planDef) {
      throw new Error("Plano não encontrado ou inativo");
    }

    // Determinar preço baseado no período de cobrança
    const isYearly = billingPeriod === 'yearly';
    const price = isYearly ? planDef.price_yearly : planDef.price_monthly;
    
    if (!price || price <= 0) {
      throw new Error(`Preço ${isYearly ? 'anual' : 'mensal'} não configurado para este plano`);
    }

    const periodLabel = isYearly ? 'Anual' : 'Mensal';
    const periodDescription = isYearly ? 'anual (12 meses)' : 'mensal';

    console.log(`[MercadoPago] Plano: ${planDef.name}, Período: ${periodLabel}, Preço: R$ ${price}`);

    // Preparar dados do pagador - COMPLETO para Mercado Pago
    const payerData: any = {
      name: profile.full_name.split(" ")[0],
      surname: profile.full_name.split(" ").slice(1).join(" ") || profile.full_name,
      email: profile.email,
    };

    // Adicionar CPF/CNPJ (obrigatório para cartão)
    if (profile.cpf_cnpj) {
      const cleanDoc = profile.cpf_cnpj.replace(/\D/g, "");
      payerData.identification = {
        type: cleanDoc.length > 11 ? "CNPJ" : "CPF",
        number: cleanDoc,
      };
    }

    // Adicionar telefone (obrigatório para pagamento com cartão)
    if (profile.phone_normalized || profile.phone_raw) {
      const phoneClean = (profile.phone_normalized || profile.phone_raw || "").replace(/\D/g, "");
      if (phoneClean.length >= 10) {
        payerData.phone = {
          area_code: phoneClean.substring(0, 2),
          number: phoneClean.substring(2),
        };
      }
    }

    // Adicionar endereço se disponível
    if (profile.address_cep && profile.address_street) {
      payerData.address = {
        zip_code: profile.address_cep.replace(/\D/g, ""),
        street_name: profile.address_street,
        street_number: profile.address_number || "S/N",
      };
    }

    // Criar external_reference única
    const externalReference = `fichazen_${user.id}_${Date.now()}`;

    // URL de produção do FichaZen
    const baseUrl = "https://fichazen.com.br";
    const webhookUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

    // Criar preferência de pagamento no Mercado Pago
    const preferenceData = {
      items: [
        {
          id: planDef.id,
          title: `FichaZen ${planDef.name} - ${periodLabel}`,
          description: `Assinatura ${periodDescription} do plano ${planDef.name}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(price),
        },
      ],
      payer: payerData,
      back_urls: {
        success: `${baseUrl}/configuracoes/perfil?payment=success`,
        failure: `${baseUrl}/configuracoes/perfil?payment=failed`,
        pending: `${baseUrl}/configuracoes/perfil?payment=pending`,
      },
      // Habilitar todos os métodos de pagamento incluindo PIX
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: isYearly ? 12 : 12, // Até 12x para ambos
      },
      auto_return: "approved",
      notification_url: webhookUrl,
      external_reference: externalReference,
      statement_descriptor: "FICHAZEN",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    };

    console.log(`[MercadoPago] Criando preferência:`, JSON.stringify(preferenceData, null, 2));

    // Chamar API do Mercado Pago
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mercadopagoAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    });

    const mpResult = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error(`[MercadoPago] Erro da API:`, mpResult);
      throw new Error(`Erro do Mercado Pago: ${mpResult.message || JSON.stringify(mpResult)}`);
    }

    console.log(`[MercadoPago] Preferência criada: ${mpResult.id}`);

    // Salvar transação no banco
    const { data: transaction, error: transactionError } = await supabase
      .from("billing_transactions")
      .insert({
        professional_id: user.id,
        plan_id: planId,
        amount: price,
        status: "pending",
        payment_gateway: "mercadopago",
        mercadopago_preference_id: mpResult.id,
        mercadopago_payment_url: mpResult.init_point,
        customer_data: payerData,
        metadata: {
          external_reference: externalReference,
          plan_name: planDef.name,
          billing_period: billingPeriod,
          created_via: "checkout_pro",
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error(`[MercadoPago] Erro ao salvar transação:`, transactionError);
      throw new Error("Erro ao registrar transação");
    }

    console.log(`[MercadoPago] Transação salva: ${transaction.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: mpResult.init_point,
        preferenceId: mpResult.id,
        transactionId: transaction.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    console.error(`[MercadoPago] Erro:`, error);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
