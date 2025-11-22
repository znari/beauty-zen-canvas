-- Criar tabela para registrar transações de pagamento
CREATE TABLE public.billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dados do Abacate Pay
  abacate_bill_id TEXT UNIQUE,
  abacate_payment_url TEXT,
  
  -- Dados do plano
  plan_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  
  -- Status do pagamento
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Dados do cliente (snapshot no momento da compra)
  customer_data JSONB NOT NULL,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para validar status
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'failed', 'cancelled'))
);

-- Habilitar RLS
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário pode ver apenas suas próprias transações
CREATE POLICY "users_view_own_transactions"
  ON public.billing_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = professional_id);

-- Função para atualizar updated_at (caso não exista)
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER set_updated_at_billing
  BEFORE UPDATE ON public.billing_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_column();

-- Índices para performance
CREATE INDEX idx_billing_abacate_bill_id ON public.billing_transactions(abacate_bill_id);
CREATE INDEX idx_billing_professional ON public.billing_transactions(professional_id);
CREATE INDEX idx_billing_status ON public.billing_transactions(status);