-- Adicionar coluna para preço anual na tabela plan_definitions
ALTER TABLE plan_definitions ADD COLUMN IF NOT EXISTS price_yearly numeric DEFAULT NULL;

-- Atualizar preços anuais com 30% de desconto
-- Zen Essencial: R$ 39,90 × 12 = R$ 478,80 - 30% = R$ 335,16
UPDATE plan_definitions SET price_yearly = 335.16 WHERE id = 'essencial';

-- Zen Pro: R$ 89,90 × 12 = R$ 1.078,80 - 30% = R$ 755,16
UPDATE plan_definitions SET price_yearly = 755.16 WHERE id = 'pro';

-- Zen Ultimate: R$ 129,90 × 12 = R$ 1.558,80 - 30% = R$ 1.091,16
UPDATE plan_definitions SET price_yearly = 1091.16 WHERE id = 'ultimate';