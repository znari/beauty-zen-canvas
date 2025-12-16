-- Limpar stripe_customer_id inválido (ambiente de teste)
UPDATE profiles 
SET stripe_customer_id = NULL 
WHERE stripe_customer_id = 'cus_TbiYyASYdRJemD';