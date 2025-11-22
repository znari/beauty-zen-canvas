import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  try {
    // ========================================
    // 🔒 VALIDAÇÃO DE SEGURANÇA
    // ========================================
    const receivedSecret = req.headers.get('X-Webhook-Secret');
    const expectedSecret = Deno.env.get('ABACATE_WEBHOOK_SECRET');

    console.log('🔐 Validando secret do webhook...');

    // Verificar se o secret foi configurado
    if (!expectedSecret) {
      console.error('⚠️ ABACATE_WEBHOOK_SECRET não configurado no Supabase!');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Webhook secret not configured' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase com service role para logging
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se o secret foi enviado na requisição
    if (!receivedSecret) {
      console.error('🚨 Tentativa de acesso sem secret!');
      console.error('📍 Headers recebidos:', {
        ip: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
        origin: req.headers.get('origin')
      });

      // Registrar tentativa de acesso não autorizada
      await supabaseAdmin.from('webhook_security_logs').insert({
        endpoint: 'abacate-webhook',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        origin: req.headers.get('origin'),
        received_secret_preview: null,
        success: false,
        error_message: 'Missing webhook secret'
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Missing webhook secret' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar o secret (comparação segura)
    if (receivedSecret !== expectedSecret) {
      console.error('🚨 Tentativa de acesso com secret INVÁLIDO!');
      console.error('📍 Secret recebido (preview):', receivedSecret.substring(0, 10) + '...');
      console.error('📍 IP/Headers:', {
        ip: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent')
      });

      // Registrar tentativa com secret inválido
      await supabaseAdmin.from('webhook_security_logs').insert({
        endpoint: 'abacate-webhook',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        origin: req.headers.get('origin'),
        received_secret_preview: receivedSecret?.substring(0, 10),
        success: false,
        error_message: 'Invalid webhook secret'
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Invalid webhook secret' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Secret validado com sucesso!');

    // Registrar acesso autorizado
    await supabaseAdmin.from('webhook_security_logs').insert({
      endpoint: 'abacate-webhook',
      ip_address: req.headers.get('x-forwarded-for'),
      user_agent: req.headers.get('user-agent'),
      origin: req.headers.get('origin'),
      received_secret_preview: receivedSecret.substring(0, 10),
      success: true,
      error_message: null
    });

    // ========================================
    // FIM DA VALIDAÇÃO DE SEGURANÇA
    // ========================================

    const webhookData = await req.json();
    
    console.log('📨 Webhook recebido do Abacate Pay');
    console.log('📊 Dados:', JSON.stringify(webhookData, null, 2));

    // Extrair dados do webhook (estrutura correta: data.billing.id e data.billing.status)
    const billId = webhookData.data?.billing?.id;
    const status = webhookData.data?.billing?.status;
    
    if (!billId) {
      console.error('❌ Bill ID não encontrado no webhook');
      console.error('📊 Estrutura recebida:', JSON.stringify(webhookData, null, 2));
      throw new Error('Bill ID não encontrado no webhook');
    }

    if (!status) {
      console.error('❌ Status não encontrado no webhook');
      console.error('📊 Estrutura recebida:', JSON.stringify(webhookData, null, 2));
      throw new Error('Status não encontrado no webhook');
    }

    console.log(`🔍 Processando bill_id: ${billId}, status: ${status}`);

    // Buscar transação no banco
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('billing_transactions')
      .select('*')
      .eq('abacate_bill_id', billId)
      .single();

    if (txError || !transaction) {
      console.error('❌ Transação não encontrada:', billId);
      throw new Error('Transação não encontrada');
    }

    console.log(`✅ Transação encontrada: ${transaction.id}`);

    // Atualizar status da transação
    let newStatus = 'pending';
    let paidAt = null;

    switch (status) {
      case 'PAID':
        newStatus = 'paid';
        paidAt = new Date().toISOString();
        console.log('💰 Pagamento confirmado!');
        break;
      case 'ACTIVE':
        newStatus = 'paid';
        paidAt = new Date().toISOString();
        console.log('💰 Assinatura ativa! Pagamento confirmado.');
        break;
      case 'CANCELLED':
        newStatus = 'cancelled';
        console.log('🚫 Pagamento cancelado');
        break;
      case 'FAILED':
        newStatus = 'failed';
        console.log('❌ Pagamento falhou');
        break;
      default:
        newStatus = 'pending';
        console.log('⏳ Pagamento pendente');
    }

    // Atualizar transação
    const { error: updateTxError } = await supabaseAdmin
      .from('billing_transactions')
      .update({
        status: newStatus,
        paid_at: paidAt,
        metadata: {
          billing: webhookData.data?.billing,
          payment: webhookData.data?.payment,
          event: webhookData.event,
          webhookId: webhookData.id,
          receivedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    if (updateTxError) {
      console.error('❌ Erro ao atualizar transação:', updateTxError);
      throw updateTxError;
    }

    console.log(`✅ Transação atualizada para status: ${newStatus}`);

    // Atualizar perfil do usuário com o novo plano
    if (newStatus === 'paid') {
      console.log(`🎉 Pagamento confirmado! Ativando plano ${transaction.plan_id}`);
      
      // Calcular data de expiração baseada na frequência
      const subscriptionEndsAt = new Date();
      const frequency = transaction.frequency || 'ONE_TIME';
      
      switch (frequency) {
        case 'MONTHLY':
          subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
          break;
        case 'QUARTERLY':
          subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 3);
          break;
        case 'YEARLY':
          subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
          break;
        default: // ONE_TIME
          subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          plan: transaction.plan_id,
          subscription_status: frequency === 'ONE_TIME' ? 'trial' : 'active',
          subscription_started_at: new Date().toISOString(),
          last_payment_date: new Date().toISOString(),
          subscription_ends_at: subscriptionEndsAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.professional_id);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        throw new Error('Erro ao atualizar perfil do usuário');
      }

      console.log(`🎉 Plano ${transaction.plan_id} ativado para usuário ${transaction.professional_id}`);
      console.log(`📅 Válido até: ${subscriptionEndsAt.toISOString()}`);
      console.log(`🔄 Frequência: ${frequency}`);
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
