import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando criação de cobrança Abacate Pay');
    
    // 1. Verificar e extrair token JWT do header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Header de autorização inválido');
      throw new Error('Não autenticado - token ausente ou inválido');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token JWT encontrado');

    // 2. Criar cliente admin para validar o token
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Validar token e obter usuário
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ Token inválido ou expirado:', userError?.message);
      throw new Error('Não autenticado - sessão inválida ou expirada');
    }

    console.log('✅ Usuário autenticado:', user.id);

    console.log('✅ Usuário autenticado:', user.id);

    // 4. Receber dados do body
    const { planId } = await req.json();
    
    if (!planId) {
      throw new Error('planId é obrigatório');
    }

    console.log('📦 Plano solicitado:', planId);

    // 5. Buscar dados do perfil (usando admin client)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      throw new Error('Perfil não encontrado');
    }

    console.log('👤 Perfil encontrado:', profile.full_name);

    // 6. Buscar definição do plano (usando admin client)
    const { data: planDef, error: planError } = await supabaseAdmin
      .from('plan_definitions')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !planDef) {
      console.error('❌ Erro ao buscar plano:', planError);
      throw new Error('Plano não encontrado');
    }

    console.log('📋 Plano encontrado:', planDef.name, '- R$', planDef.price_monthly);

    // 7. Validar dados obrigatórios
    if (!profile.full_name || !profile.email) {
      throw new Error('Dados incompletos: nome e email são obrigatórios');
    }

    if (!profile.cpf_cnpj) {
      throw new Error('CPF/CNPJ não informado. Por favor, atualize seu perfil.');
    }

    // 8. Preparar dados para o Abacate Pay
    const amountInCents = Math.round(planDef.price_monthly * 100);
    
    const billingData = {
      frequency: "MULTIPLE_PAYMENTS",
      methods: ["PIX"],
      products: [{
        externalId: planDef.id,
        name: `FichaZen ${planDef.name}`,
        description: `Assinatura mensal do plano ${planDef.name}`,
        quantity: 1,
        price: amountInCents
      }],
      returnUrl: `https://preview--beauty-zen-canvas.lovable.app/configuracoes/perfil`,
      completionUrl: `https://preview--beauty-zen-canvas.lovable.app/configuracoes/perfil?payment=success`,
      customer: {
        name: profile.full_name,
        cellphone: profile.phone_raw || "(00) 00000-0000",
        email: profile.email,
        taxId: profile.cpf_cnpj
      },
      recurrence: {
        interval: "MONTHLY",
        maxPayments: 12,
        startDate: new Date().toISOString()
      },
      allowCoupons: false,
      externalId: `fichazen_${user.id}_${Date.now()}`,
      metadata: {
        userId: user.id,
        planId: planId,
        environment: 'production',
        subscriptionType: 'monthly'
      }
    };

    console.log('💳 Criando cobrança no Abacate Pay...');

    // 9. Chamar API do Abacate Pay
    const abacateResponse = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ABACATE_PAY_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(billingData)
    });

    const abacateResult = await abacateResponse.json();

    if (abacateResult.error) {
      console.error('❌ Erro do Abacate Pay:', abacateResult.error);
      throw new Error(`Erro do Abacate Pay: ${abacateResult.error}`);
    }

    console.log('✅ Cobrança criada:', abacateResult.data.id);

    // 10. Salvar transação no banco (já usando admin)
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('billing_transactions')
      .insert({
        professional_id: user.id,
        abacate_bill_id: abacateResult.data.id,
        abacate_payment_url: abacateResult.data.url,
        plan_id: planId,
        amount: amountInCents,
        status: 'pending',
        frequency: 'MONTHLY',
        customer_data: {
          name: profile.full_name,
          email: profile.email,
          cpf: profile.cpf_cnpj,
          phone: profile.phone_raw
        },
        metadata: abacateResult.data
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Erro ao salvar transação:', transactionError);
      throw new Error('Erro ao salvar transação');
    }

    console.log('💾 Transação salva:', transaction.id);

    // 11. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: abacateResult.data.url,
        billId: abacateResult.data.id,
        transactionId: transaction.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
