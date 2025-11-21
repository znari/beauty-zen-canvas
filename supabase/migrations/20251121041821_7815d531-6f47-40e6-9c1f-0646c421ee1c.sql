-- Adicionar campos de assinatura na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS subscription_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_payment_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS storage_used_mb numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS professionals_count integer DEFAULT 1;

COMMENT ON COLUMN public.profiles.subscription_status IS 'Status da assinatura: trialing, active, cancelled, expired, payment_required';
COMMENT ON COLUMN public.profiles.plan IS 'Plano contratado: free, essencial, pro, ultimate, ultimate_plus';

-- Criar tabela de definições de planos
CREATE TABLE IF NOT EXISTS public.plan_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_monthly numeric NOT NULL,
  max_clients integer,
  max_anamneses integer,
  max_storage_gb numeric,
  max_professionals integer,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.plan_definitions ENABLE ROW LEVEL SECURITY;

-- Policy para permitir leitura pública dos planos
CREATE POLICY "plan_definitions_public_read"
ON public.plan_definitions
FOR SELECT
USING (is_active = true);

-- Inserir planos
INSERT INTO public.plan_definitions (id, name, price_monthly, max_clients, max_anamneses, max_storage_gb, max_professionals, features, display_order) VALUES
('essencial', 'Zen Essencial', 39.90, 10, 10, 2, 1, '[
  "Até 10 clientes",
  "Até 10 fichas de anamnese",
  "2GB de armazenamento",
  "1 profissional",
  "Envio de confirmações via WhatsApp",
  "Histórico com fotos antes/depois",
  "Cadastro de procedimentos",
  "Suporte por WhatsApp"
]'::jsonb, 1),

('pro', 'Zen Pro', 89.90, 50, 50, 10, 5, '[
  "Até 50 clientes",
  "Até 50 fichas de anamnese",
  "10GB de armazenamento",
  "Até 5 profissionais",
  "Todas as funcionalidades do Essencial"
]'::jsonb, 2),

('ultimate', 'Zen Ultimate', 129.90, NULL, NULL, NULL, NULL, '[
  "Clientes ilimitados",
  "Fichas ilimitadas",
  "Armazenamento ilimitado",
  "Profissionais ilimitados",
  "Todas as funcionalidades do Pro"
]'::jsonb, 3),

('ultimate_plus', 'Zen Ultimate + Atendente Virtual', 0, NULL, NULL, NULL, NULL, '[
  "Tudo do Zen Ultimate",
  "Agente de IA para atendimento automático no WhatsApp",
  "Agendamentos automáticos via IA",
  "Respostas inteligentes",
  "Entre em contato para saber mais"
]'::jsonb, 4);

-- Atualizar trigger de criação de usuário para configurar período de teste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    studio_name, 
    phone_raw,
    cpf_cnpj,
    plan,
    subscription_status,
    trial_ends_at,
    subscription_started_at,
    professionals_count,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'studio_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', ''),
    'free',
    'trialing',
    NOW() + INTERVAL '15 days',
    NOW(),
    1,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$function$;