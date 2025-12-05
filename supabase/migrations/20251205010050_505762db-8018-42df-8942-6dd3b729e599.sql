-- Function to get detailed user information for admin
CREATE OR REPLACE FUNCTION public.get_admin_user_details(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile JSON;
  v_clients JSON;
  v_team JSON;
  v_transactions JSON;
  v_result JSON;
BEGIN
  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver estes dados';
  END IF;
  
  -- Get profile data
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'full_name', p.full_name,
    'studio_name', p.studio_name,
    'phone_raw', p.phone_raw,
    'cpf_cnpj', p.cpf_cnpj,
    'avatar_url', p.avatar_url,
    'plan', p.plan,
    'subscription_status', p.subscription_status,
    'trial_ends_at', p.trial_ends_at,
    'subscription_started_at', p.subscription_started_at,
    'subscription_ends_at', p.subscription_ends_at,
    'last_payment_date', p.last_payment_date,
    'created_at', p.created_at,
    'address_city', p.address_city,
    'address_state', p.address_state
  ) INTO v_profile
  FROM profiles p
  WHERE p.id = p_user_id;
  
  -- Get clients (last 10)
  SELECT COALESCE(json_agg(c ORDER BY c.created_at DESC), '[]'::json) INTO v_clients
  FROM (
    SELECT 
      id,
      name,
      whatsapp_raw,
      created_at
    FROM clients
    WHERE professional_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) c;
  
  -- Get team members
  SELECT COALESCE(json_agg(t ORDER BY t.is_owner DESC, t.created_at ASC), '[]'::json) INTO v_team
  FROM (
    SELECT 
      id,
      name,
      email,
      specialty,
      is_owner,
      is_active,
      created_at
    FROM team_members
    WHERE owner_id = p_user_id
  ) t;
  
  -- Get billing transactions
  SELECT COALESCE(json_agg(bt ORDER BY bt.created_at DESC), '[]'::json) INTO v_transactions
  FROM (
    SELECT 
      id,
      plan_id,
      amount,
      status,
      payment_gateway,
      frequency,
      created_at,
      paid_at
    FROM billing_transactions
    WHERE professional_id = p_user_id
    ORDER BY created_at DESC
  ) bt;
  
  -- Build result
  v_result := json_build_object(
    'profile', v_profile,
    'clients', v_clients,
    'team', v_team,
    'transactions', v_transactions
  );
  
  RETURN v_result;
END;
$$;