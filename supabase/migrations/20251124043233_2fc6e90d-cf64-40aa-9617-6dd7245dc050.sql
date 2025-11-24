-- Corrigir search_path da função create_default_message_templates
CREATE OR REPLACE FUNCTION create_default_message_templates()
RETURNS TRIGGER AS $$
BEGIN
  -- Template 1: Confirmação Padrão
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Confirmação Padrão', 'ConfirmacaoAgendamento', E'Oi [nomeCliente]! ✨\n\nSeu agendamento está confirmado para [dataProcedimento] às [horaProcedimento].\n\nTe esperamos com muito carinho 💕\n— [nomeStudio]', true);
  
  -- Template 2: Confirmação com Lembrete de Ficha
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Confirmação com Lembrete de Ficha', 'ConfirmacaoAgendamento', E'Oi [nomeCliente]! ✨\n\nSeu agendamento está confirmado para [dataProcedimento] às [horaProcedimento].\n\n🌸 Lembre-se de preencher sua ficha de anamnese antes do atendimento!\n\nTe esperamos com muito carinho 💕\n— [nomeStudio]', false);
  
  -- Template 3: Envio de Ficha Padrão
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Envio de Ficha Padrão', 'EnvioFicha', E'Oi [nomeCliente]! 🌸\n\nPara garantir o melhor atendimento, precisamos que você preencha sua ficha de anamnese.\n\nPor favor, acesse o link abaixo:\n[linkFicha]\n\nObrigada 💕\n— [nomeStudio]', true);
  
  -- Template 4: Envio de Ficha - Urgente
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Envio de Ficha - Urgente', 'EnvioFicha', E'Oi [nomeCliente]! 🌸\n\n⏰ IMPORTANTE: Precisamos que você preencha sua ficha de anamnese o quanto antes!\n\nClique no link abaixo para preencher agora:\n[linkFicha]\n\nÉ super rápido e essencial para seu atendimento 💕\n\n— [nomeStudio]', false);
  
  -- Template 5: Lembrete Padrão
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Lembrete Padrão', 'Lembrete', E'Oi [nomeCliente]! ✨\n\nPassando para lembrar do seu horário amanhã às [horaProcedimento].\n\nTe esperamos com muito carinho 💕\n— [nomeStudio]', true);
  
  -- Template 6: Lembrete Urgente
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Lembrete Urgente', 'Lembrete', E'Oi [nomeCliente]! ⏰\n\nLEMBRETE IMPORTANTE: Seu horário é amanhã às [horaProcedimento]!\n\nPor favor, confirme sua presença 🙏\nSe não puder comparecer, avise com antecedência para reagendarmos 💕\n\n— [nomeStudio]', false);
  
  -- Template 7: Agradecimento Padrão
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Agradecimento Padrão', 'Agradecimento', E'Obrigada [nomeCliente]! 💖\n\nFoi um prazer te atender hoje!\nEspero te ver novamente em breve 🌷\n\n— [nomeStudio]', true);
  
  -- Template 8: Agradecimento + Avaliação
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Agradecimento + Avaliação', 'Agradecimento', E'Obrigada [nomeCliente]! 💖\n\nFoi um prazer te atender hoje!\n\n💬 Sua opinião é muito importante! Se puder, deixe uma avaliação no nosso Instagram 🌟\n\nAté a próxima 🌷\n— [nomeStudio]', false);
  
  -- Template 9: Boas-Vindas Padrão
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Boas-Vindas Padrão', 'BoasVindas', E'Olá [nomeCliente]! 💫\n\nSeja bem-vinda! Estamos muito felizes em te receber 🌸\n\nQualquer dúvida, estamos à disposição 💕\n— [nomeStudio]', true);
  
  -- Template 10: Reagendamento Padrão
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Reagendamento Padrão', 'Reagendamento', E'Oi [nomeCliente]! 💫\n\nSeu agendamento foi reagendado para [dataProcedimento] às [horaProcedimento].\nSe precisar alterar novamente, é só me avisar por aqui 🌸\n\n— [nomeStudio]', true);
  
  -- Template 11: Cancelamento Padrão
  INSERT INTO message_templates (professional_id, nome, tipo, conteudo, is_padrao) VALUES
    (NEW.id, 'Cancelamento Padrão', 'Cancelamento', E'Oi [nomeCliente]! ⚠️\n\nSeu agendamento foi cancelado com sucesso.\nQuando quiser marcar novamente, é só me chamar 💅\n\n— [nomeStudio]', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;