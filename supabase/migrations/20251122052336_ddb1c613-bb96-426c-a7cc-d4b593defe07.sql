-- Adicionar coluna frequency para suportar assinaturas recorrentes
ALTER TABLE billing_transactions 
ADD COLUMN frequency text DEFAULT 'ONE_TIME';

COMMENT ON COLUMN billing_transactions.frequency IS 'Frequência de pagamento: ONE_TIME, MONTHLY, QUARTERLY, YEARLY';