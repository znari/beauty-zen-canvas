import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

interface Visit {
  id: string;
  professional_id: string;
  client_id: string;
  visit_date: string;
  visit_time: string;
  clients: {
    name: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar secret do cron
    const cronSecret = req.headers.get('X-Cron-Secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');

    if (!cronSecret || cronSecret !== expectedSecret) {
      console.error('❌ Acesso negado: secret inválido ou ausente');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔔 Iniciando verificação de lembretes de visitas...');

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar visitas agendadas para as próximas 24h
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`📅 Buscando visitas para ${tomorrowStr}...`);

    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select(`
        id,
        professional_id,
        client_id,
        visit_date,
        visit_time,
        clients!inner(name)
      `)
      .eq('status', 'scheduled')
      .eq('visit_date', tomorrowStr);

    if (visitsError) {
      console.error('❌ Erro ao buscar visitas:', visitsError);
      throw visitsError;
    }

    console.log(`✅ Encontradas ${visits?.length || 0} visitas para amanhã`);

    if (!visits || visits.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma visita encontrada para amanhã',
          reminders_sent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Para cada visita, verificar se já existe notificação de lembrete
    let remindersSent = 0;

    for (const visit of visits) {
      const clientName = (visit.clients as any).name;
      
      // Verificar se já existe notificação de lembrete para esta visita
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('visit_id', visit.id)
        .eq('type', 'visit_reminder')
        .single();

      // Se já existe, pular
      if (existingNotification) {
        console.log(`⏭️  Lembrete já enviado para visita ${visit.id}`);
        continue;
      }

      // Formatar hora
      const visitTime = visit.visit_time.slice(0, 5);

      // Criar notificação de lembrete
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          professional_id: visit.professional_id,
          client_id: visit.client_id,
          visit_id: visit.id,
          type: 'visit_reminder',
          title: 'Lembrete de consulta',
          message: `${clientName} tem consulta amanhã às ${visitTime}`,
        });

      if (notificationError) {
        console.error(`❌ Erro ao criar notificação para visita ${visit.id}:`, notificationError);
      } else {
        console.log(`✅ Lembrete criado para ${clientName} (amanhã às ${visitTime})`);
        remindersSent++;
      }
    }

    console.log(`🎉 Processo concluído! ${remindersSent} lembretes enviados`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${remindersSent} lembretes enviados`,
        reminders_sent: remindersSent,
        total_visits: visits.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
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
