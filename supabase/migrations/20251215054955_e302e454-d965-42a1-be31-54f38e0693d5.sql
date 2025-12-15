-- Adicionar colunas Stripe na tabela billing_transactions
ALTER TABLE billing_transactions
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

-- Adicionar colunas de preços Stripe na tabela plan_definitions
ALTER TABLE plan_definitions
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT;

-- Adicionar stripe_customer_id na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Atualizar plan_definitions com os price_ids do Stripe
UPDATE plan_definitions SET 
  stripe_price_id_monthly = 'price_1SeThUGn1TAKd50IWw1B5YkR',
  stripe_price_id_yearly = 'price_1SeThUGn1TAKd50IxJyqO1hV'
WHERE id = 'essencial';

UPDATE plan_definitions SET 
  stripe_price_id_monthly = 'price_1SeUduGn1TAKd50IxnERZ2kZ',
  stripe_price_id_yearly = 'price_1SeUeKGn1TAKd50IVt8hBNVi'
WHERE id = 'pro';

UPDATE plan_definitions SET 
  stripe_price_id_monthly = 'price_1SeUeYGn1TAKd50IsYIf0jlI',
  stripe_price_id_yearly = 'price_1SeUerGn1TAKd50IynAZqbsA'
WHERE id = 'ultimate';