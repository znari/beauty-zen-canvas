-- Deletar templates de "Confirmação Padrão" duplicados criados pela migration defeituosa
-- (mantém apenas 1 template de Confirmação Padrão por profissional)
DELETE FROM message_templates
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY professional_id, tipo, nome ORDER BY created_at) as rn
    FROM message_templates
    WHERE nome = 'Confirmação Padrão' AND tipo = 'ConfirmacaoAgendamento'
  ) t
  WHERE t.rn > 1
);

-- Popular todos os 11 templates para profissionais que ainda não os têm
DO $$
DECLARE
  prof_record RECORD;
BEGIN
  FOR prof_record IN SELECT id FROM profiles LOOP
    
    -- Template 1: Confirmação Padrão
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Confirmação Padrão', 'ConfirmacaoAgendamento', 
           E'Oi [nomeCliente]! ✨\n\nSeu agendamento está confirmado para [dataProcedimento] às [horaProcedimento].\n\nTe esperamos com muito carinho 💕\n— [nomeStudio]', 
           true
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'ConfirmacaoAgendamento' 
      AND nome = 'Confirmação Padrão'
    );
    
    -- Template 2: Confirmação com Lembrete de Ficha
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Confirmação com Lembrete de Ficha', 'ConfirmacaoAgendamento',
           E'Oi [nomeCliente]! ✨\n\nSeu agendamento está confirmado para [dataProcedimento] às [horaProcedimento].\n\n🌸 Lembre-se de preencher sua ficha de anamnese antes do atendimento!\n\nTe esperamos com muito carinho 💕\n— [nomeStudio]',
           false
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'ConfirmacaoAgendamento' 
      AND nome = 'Confirmação com Lembrete de Ficha'
    );
    
    -- Template 3: Envio de Ficha Padrão
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Envio de Ficha Padrão', 'EnvioFicha',
           E'Oi [nomeCliente]! 🌸\n\nPara garantir o melhor atendimento, precisamos que você preencha sua ficha de anamnese.\n\nPor favor, acesse o link abaixo:\n[linkFicha]\n\nObrigada 💕\n— [nomeStudio]',
           true
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'EnvioFicha' 
      AND nome = 'Envio de Ficha Padrão'
    );
    
    -- Template 4: Envio de Ficha - Urgente
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Envio de Ficha - Urgente', 'EnvioFicha',
           E'Oi [nomeCliente]! 🌸\n\n⏰ IMPORTANTE: Precisamos que você preencha sua ficha de anamnese o quanto antes!\n\nClique no link abaixo para preencher agora:\n[linkFicha]\n\nÉ super rápido e essencial para seu atendimento 💕\n\n— [nomeStudio]',
           false
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'EnvioFicha' 
      AND nome = 'Envio de Ficha - Urgente'
    );
    
    -- Template 5: Lembrete Padrão
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Lembrete Padrão', 'Lembrete',
           E'Oi [nomeCliente]! ✨\n\nPassando para lembrar do seu horário amanhã às [horaProcedimento].\n\nTe esperamos com muito carinho 💕\n— [nomeStudio]',
           true
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'Lembrete' 
      AND nome = 'Lembrete Padrão'
    );
    
    -- Template 6: Lembrete Urgente
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Lembrete Urgente', 'Lembrete',
           E'Oi [nomeCliente]! ⏰\n\nLEMBRETE IMPORTANTE: Seu horário é amanhã às [horaProcedimento]!\n\nPor favor, confirme sua presença 🙏\nSe não puder comparecer, avise com antecedência para reagendarmos 💕\n\n— [nomeStudio]',
           false
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'Lembrete' 
      AND nome = 'Lembrete Urgente'
    );
    
    -- Template 7: Agradecimento Padrão
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Agradecimento Padrão', 'Agradecimento',
           E'Obrigada [nomeCliente]! 💖\n\nFoi um prazer te atender hoje!\nEspero te ver novamente em breve 🌷\n\n— [nomeStudio]',
           true
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'Agradecimento' 
      AND nome = 'Agradecimento Padrão'
    );
    
    -- Template 8: Agradecimento + Avaliação
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Agradecimento + Avaliação', 'Agradecimento',
           E'Obrigada [nomeCliente]! 💖\n\nFoi um prazer te atender hoje!\n\n💬 Sua opinião é muito importante! Se puder, deixe uma avaliação no nosso Instagram 🌟\n\nAté a próxima 🌷\n— [nomeStudio]',
           false
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'Agradecimento' 
      AND nome = 'Agradecimento + Avaliação'
    );
    
    -- Template 9: Boas-Vindas Padrão
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Boas-Vindas Padrão', 'BoasVindas',
           E'Olá [nomeCliente]! 💫\n\nSeja bem-vinda! Estamos muito felizes em te receber 🌸\n\nQualquer dúvida, estamos à disposição 💕\n— [nomeStudio]',
           true
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'BoasVindas' 
      AND nome = 'Boas-Vindas Padrão'
    );
    
    -- Template 10: Reagendamento Padrão
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Reagendamento Padrão', 'Reagendamento',
           E'Oi [nomeCliente]! 💫\n\nSeu agendamento foi reagendado para [dataProcedimento] às [horaProcedimento].\nSe precisar alterar novamente, é só me avisar por aqui 🌸\n\n— [nomeStudio]',
           true
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'Reagendamento' 
      AND nome = 'Reagendamento Padrão'
    );
    
    -- Template 11: Cancelamento Padrão
    INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao)
    SELECT prof_record.id, 'Cancelamento Padrão', 'Cancelamento',
           E'Oi [nomeCliente]! ⚠️\n\nSeu agendamento foi cancelado com sucesso.\nQuando quiser marcar novamente, é só me chamar 💅\n\n— [nomeStudio]',
           true
    WHERE NOT EXISTS (
      SELECT 1 FROM message_templates 
      WHERE professional_id = prof_record.id 
      AND tipo = 'Cancelamento' 
      AND nome = 'Cancelamento Padrão'
    );
    
  END LOOP;
END $$;