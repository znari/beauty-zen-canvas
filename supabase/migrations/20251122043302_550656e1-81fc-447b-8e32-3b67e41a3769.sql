-- Criar tabela para logs de segurança de webhooks
CREATE TABLE IF NOT EXISTS public.webhook_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  origin TEXT,
  received_secret_preview TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para análise de segurança (falhas recentes)
CREATE INDEX IF NOT EXISTS idx_webhook_security_failed 
ON public.webhook_security_logs(success, created_at) 
WHERE success = false;

-- Índice para análise por endpoint
CREATE INDEX IF NOT EXISTS idx_webhook_security_endpoint 
ON public.webhook_security_logs(endpoint, created_at);

-- Comentários para documentação
COMMENT ON TABLE public.webhook_security_logs IS 'Registra todas as tentativas de acesso aos webhooks para auditoria de segurança';
COMMENT ON COLUMN public.webhook_security_logs.received_secret_preview IS 'Primeiros 10 caracteres do secret recebido (apenas para auditoria)';
COMMENT ON COLUMN public.webhook_security_logs.success IS 'Se a autenticação foi bem-sucedida';

-- Habilitar RLS (somente admins podem visualizar logs de segurança)
ALTER TABLE public.webhook_security_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas usuários autenticados podem ver seus próprios logs
-- (No futuro, podemos criar um papel de admin para ver todos os logs)
CREATE POLICY webhook_logs_admin_only 
ON public.webhook_security_logs 
FOR SELECT 
USING (false); -- Por enquanto, ninguém pode ver via RLS (apenas via service role)