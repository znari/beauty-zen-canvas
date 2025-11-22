import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Profile {
  id: string;
  full_name: string;
  plan: string;
  subscription_status: string;
  subscription_ends_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Iniciando verificação de lembretes de renovação...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Data daqui a 5 dias
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    
    const todayStr = today.toISOString().split('T')[0];
    const fiveDaysStr = fiveDaysFromNow.toISOString().split('T')[0];

    console.log(`📅 Verificando vencimentos para hoje (${todayStr}) e daqui a 5 dias (${fiveDaysStr})...`);

    // Buscar perfis com assinaturas ativas que vencem em 5 dias ou hoje
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, plan, subscription_status, subscription_ends_at')
      .eq('subscription_status', 'active')
      .not('plan', 'eq', 'free')
      .not('subscription_ends_at', 'is', null)
      .or(`subscription_ends_at.eq.${fiveDaysStr},subscription_ends_at.eq.${todayStr}`);

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      throw profilesError;
    }

    console.log(`✅ Encontrados ${profiles?.length || 0} perfis para lembrete`);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma assinatura próxima ao vencimento',
          reminders_sent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let remindersSent = 0;

    for (const profile of profiles) {
      const expiryDate = new Date(profile.subscription_ends_at);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determinar tipo de lembrete
      let reminderType = '';
      let title = '';
      let message = '';

      if (daysUntilExpiry === 5) {
        reminderType = 'renewal_reminder_5days';
        title = 'Lembrete: Renovação em 5 dias';
        message = `Sua assinatura do plano ${profile.plan} vence em 5 dias. Renove agora para não perder o acesso!`;
      } else if (daysUntilExpiry === 0) {
        reminderType = 'renewal_reminder_today';
        title = 'Atenção: Assinatura vence hoje!';
        message = `Sua assinatura do plano ${profile.plan} vence hoje. Renove agora para continuar com acesso completo!`;
      } else {
        continue; // Pular outros dias
      }

      // Verificar se já existe notificação deste tipo hoje
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('professional_id', profile.id)
        .eq('type', reminderType)
        .gte('created_at', todayStr)
        .maybeSingle();

      if (existingNotification) {
        console.log(`⏭️  Lembrete já enviado para ${profile.full_name}`);
        continue;
      }

      // Criar notificação
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          professional_id: profile.id,
          type: reminderType,
          title: title,
          message: message,
        });

      if (notificationError) {
        console.error(`❌ Erro ao criar notificação para ${profile.full_name}:`, notificationError);
      } else {
        console.log(`✅ Lembrete enviado para ${profile.full_name} (${daysUntilExpiry} dias)`);
        remindersSent++;
      }
    }

    console.log(`🎉 Processo concluído! ${remindersSent} lembretes enviados`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${remindersSent} lembretes enviados`,
        reminders_sent: remindersSent,
        total_profiles: profiles.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro no processamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
