-- Enum para tipos de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles separada (segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem ver seus próprios roles
CREATE POLICY "users_view_own_roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Função SECURITY DEFINER para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- View com métricas administrativas do sistema
CREATE OR REPLACE VIEW public.v_admin_stats AS
SELECT
  -- Usuários totais
  (SELECT COUNT(*) FROM profiles)::INTEGER AS total_users,
  
  -- Usuários em trial
  (SELECT COUNT(*) FROM profiles WHERE subscription_status = 'trialing')::INTEGER AS trial_users,
  
  -- Assinantes ativos
  (SELECT COUNT(*) FROM profiles WHERE subscription_status = 'active')::INTEGER AS active_subscribers,
  
  -- Usuários churned (expirados/cancelados)
  (SELECT COUNT(*) FROM profiles WHERE subscription_status IN ('expired', 'cancelled'))::INTEGER AS churned_users,
  
  -- MRR (receita recorrente mensal baseada nos planos ativos)
  (SELECT COALESCE(SUM(
    CASE 
      WHEN plan = 'essencial' THEN 39.90
      WHEN plan = 'pro' THEN 89.90
      WHEN plan = 'ultimate' THEN 129.90
      ELSE 0
    END
  ), 0) FROM profiles WHERE subscription_status = 'active')::NUMERIC AS mrr,
  
  -- Receita total (transações pagas)
  (SELECT COALESCE(SUM(amount), 0) FROM billing_transactions WHERE status = 'paid')::NUMERIC AS total_revenue,
  
  -- Transações pagas
  (SELECT COUNT(*) FROM billing_transactions WHERE status = 'paid')::INTEGER AS paid_transactions,
  
  -- Transações pendentes
  (SELECT COUNT(*) FROM billing_transactions WHERE status = 'pending')::INTEGER AS pending_transactions,
  
  -- Novos usuários este mês
  (SELECT COUNT(*) FROM profiles WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE))::INTEGER AS new_users_this_month,
  
  -- Novos usuários mês passado
  (SELECT COUNT(*) FROM profiles WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
    AND created_at < DATE_TRUNC('month', CURRENT_DATE))::INTEGER AS new_users_last_month,
  
  -- Total de clientes cadastrados (todos os profissionais)
  (SELECT COUNT(*) FROM clients)::INTEGER AS total_clients,
  
  -- Total de visitas agendadas
  (SELECT COUNT(*) FROM visits)::INTEGER AS total_visits,
  
  -- Anamneses preenchidas
  (SELECT COUNT(*) FROM anamneses WHERE filled_at IS NOT NULL)::INTEGER AS filled_anamneses;

-- RLS Policy para v_admin_stats: apenas admins podem ver
-- Nota: Views herdam RLS das tabelas subjacentes, mas adicionamos verificação extra via função

-- Função para buscar stats (só admins)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users INTEGER,
  trial_users INTEGER,
  active_subscribers INTEGER,
  churned_users INTEGER,
  mrr NUMERIC,
  total_revenue NUMERIC,
  paid_transactions INTEGER,
  pending_transactions INTEGER,
  new_users_this_month INTEGER,
  new_users_last_month INTEGER,
  total_clients INTEGER,
  total_visits INTEGER,
  filled_anamneses INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se usuário é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver estas estatísticas';
  END IF;
  
  RETURN QUERY SELECT * FROM v_admin_stats;
END;
$$;

-- Função para listar usuários (só admins)
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  studio_name TEXT,
  plan TEXT,
  subscription_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  RETURN QUERY 
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.studio_name,
    p.plan,
    p.subscription_status,
    p.trial_ends_at,
    p.subscription_ends_at,
    p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Função para listar transações (só admins)
CREATE OR REPLACE FUNCTION public.get_admin_transactions()
RETURNS TABLE (
  id UUID,
  professional_id UUID,
  plan_id TEXT,
  amount NUMERIC,
  status TEXT,
  payment_gateway TEXT,
  frequency TEXT,
  created_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  user_email TEXT,
  user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  RETURN QUERY 
  SELECT 
    bt.id,
    bt.professional_id,
    bt.plan_id,
    bt.amount,
    bt.status,
    bt.payment_gateway,
    bt.frequency,
    bt.created_at,
    bt.paid_at,
    p.email as user_email,
    p.full_name as user_name
  FROM billing_transactions bt
  LEFT JOIN profiles p ON p.id = bt.professional_id
  ORDER BY bt.created_at DESC;
END;
$$;

-- Função para crescimento mensal (últimos 6 meses)
CREATE OR REPLACE FUNCTION public.get_admin_growth()
RETURNS TABLE (
  month TEXT,
  new_users INTEGER,
  new_subscribers INTEGER,
  revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  RETURN QUERY 
  SELECT 
    TO_CHAR(DATE_TRUNC('month', m.month_date), 'Mon/YY') as month,
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', m.month_date)) as new_users,
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE DATE_TRUNC('month', subscription_started_at) = DATE_TRUNC('month', m.month_date) AND subscription_status = 'active') as new_subscribers,
    (SELECT COALESCE(SUM(amount), 0)::NUMERIC FROM billing_transactions WHERE DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', m.month_date) AND status = 'paid') as revenue
  FROM generate_series(
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months'),
    DATE_TRUNC('month', CURRENT_DATE),
    INTERVAL '1 month'
  ) AS m(month_date)
  ORDER BY m.month_date ASC;
END;
$$;