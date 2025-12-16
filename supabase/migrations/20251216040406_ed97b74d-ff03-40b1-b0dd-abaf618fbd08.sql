-- Atualizar Price IDs do Stripe para todos os planos

-- Zen Essencial
UPDATE plan_definitions 
SET 
  stripe_price_id_monthly = 'price_1SenpUK4d7fDqh4oNzeDwfQ2',
  stripe_price_id_yearly = 'price_1SenpUK4d7fDqh4ogswOUek6'
WHERE id = 'essencial';

-- Zen Pro
UPDATE plan_definitions 
SET 
  stripe_price_id_monthly = 'price_1SenqUK4d7fDqh4oIiSOb71Y',
  stripe_price_id_yearly = 'price_1Senr3K4d7fDqh4oVbbqpKb6'
WHERE id = 'pro';

-- Zen Ultimate
UPDATE plan_definitions 
SET 
  stripe_price_id_monthly = 'price_1SentCK4d7fDqh4oKSjAxM4l',
  stripe_price_id_yearly = 'price_1SentCK4d7fDqh4oMiAhRWvO'
WHERE id = 'ultimate';