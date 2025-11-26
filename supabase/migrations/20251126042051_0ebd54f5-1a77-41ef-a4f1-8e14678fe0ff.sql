-- Adicionar colunas para suportar múltiplos gateways de pagamento
ALTER TABLE billing_transactions 
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'abacate',
ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_url TEXT;

-- Criar índice para busca por gateway
CREATE INDEX IF NOT EXISTS idx_billing_transactions_gateway ON billing_transactions(payment_gateway);

-- Criar índice para busca por Mercado Pago payment_id
CREATE INDEX IF NOT EXISTS idx_billing_transactions_mp_payment_id ON billing_transactions(mercadopago_payment_id);