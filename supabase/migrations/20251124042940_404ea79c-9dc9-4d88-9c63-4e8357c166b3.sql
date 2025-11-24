-- Criar tabela de templates de mensagem
CREATE TABLE message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('ConfirmacaoAgendamento', 'EnvioFicha', 'Lembrete', 'Agradecimento', 'BoasVindas', 'Reagendamento', 'Cancelamento')),
  conteudo text NOT NULL,
  is_padrao boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_message_templates_professional ON message_templates(professional_id);
CREATE INDEX idx_message_templates_tipo ON message_templates(tipo);

-- RLS Policies
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON message_templates FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can insert own templates"
  ON message_templates FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can update own templates"
  ON message_templates FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can delete own templates"
  ON message_templates FOR DELETE
  USING (auth.uid() = professional_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_column();

-- Função para criar os 11 templates padrão baseados no mockTemplates.ts
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar templates ao criar perfil
CREATE TRIGGER on_profile_created_create_templates
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_message_templates();