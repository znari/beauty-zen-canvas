import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  try {
    const webhookData = await req.json();
    
    console.log('📨 Webhook recebido do Abacate Pay');
    console.log('📊 Dados:', JSON.stringify(webhookData, null, 2));

    // Criar cliente Supabase com service role (sem auth)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extrair dados do webhook
    const billId = webhookData.data?.id;
    const status = webhookData.data?.status;
    
    if (!billId) {
      console.error('❌ Bill ID não encontrado no webhook');
      throw new Error('Bill ID não encontrado no webhook');
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
        metadata: webhookData.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    if (updateTxError) {
      console.error('❌ Erro ao atualizar transação:', updateTxError);
      throw updateTxError;
    }

    console.log(`✅ Transação atualizada para status: ${newStatus}`);

    // Se pagamento foi confirmado, ativar o plano
    if (newStatus === 'paid') {
      const subscriptionEndsAt = new Date();
      subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          plan: transaction.plan_id,
          subscription_status: 'active',
          subscription_started_at: new Date().toISOString(),
          last_payment_date: new Date().toISOString(),
          subscription_ends_at: subscriptionEndsAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.professional_id);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      console.log(`🎉 Plano ${transaction.plan_id} ativado para usuário ${transaction.professional_id}`);
      console.log(`📅 Válido até: ${subscriptionEndsAt.toISOString()}`);
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
