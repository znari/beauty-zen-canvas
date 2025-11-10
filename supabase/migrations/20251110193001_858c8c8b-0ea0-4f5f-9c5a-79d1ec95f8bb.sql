-- Adicionar coluna para registrar quando o procedimento foi completado
ALTER TABLE visits 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhorar performance em consultas de relatórios
CREATE INDEX idx_visits_status_completed ON visits(status, completed_at);
CREATE INDEX idx_visits_professional_completed ON visits(professional_id, completed_at) WHERE status = 'completed';