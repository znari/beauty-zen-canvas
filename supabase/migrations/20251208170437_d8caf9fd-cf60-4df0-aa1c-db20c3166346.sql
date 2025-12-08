-- Function to update user plan (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_plan(
  p_user_id uuid,
  p_plan text,
  p_subscription_status text,
  p_subscription_ends_at timestamp with time zone DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem alterar planos';
  END IF;
  
  -- Validate plan
  IF p_plan NOT IN ('free', 'essencial', 'pro', 'ultimate') THEN
    RAISE EXCEPTION 'Plano inválido: %', p_plan;
  END IF;
  
  -- Validate status
  IF p_subscription_status NOT IN ('trialing', 'active', 'expired', 'cancelled') THEN
    RAISE EXCEPTION 'Status inválido: %', p_subscription_status;
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET 
    plan = p_plan,
    subscription_status = p_subscription_status,
    subscription_ends_at = p_subscription_ends_at,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_user_id;
  END IF;
  
  RETURN json_build_object('success', true, 'user_id', p_user_id);
END;
$$;

-- Function to send individual notification (admin only)
CREATE OR REPLACE FUNCTION public.admin_send_notification(
  p_user_id uuid,
  p_title text,
  p_message text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem enviar notificações';
  END IF;
  
  -- Validate inputs
  IF p_title IS NULL OR p_title = '' THEN
    RAISE EXCEPTION 'Título é obrigatório';
  END IF;
  
  IF p_message IS NULL OR p_message = '' THEN
    RAISE EXCEPTION 'Mensagem é obrigatória';
  END IF;
  
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_user_id;
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (professional_id, title, message, type)
  VALUES (p_user_id, p_title, p_message, 'admin_notification')
  RETURNING id INTO v_notification_id;
  
  RETURN json_build_object('success', true, 'notification_id', v_notification_id);
END;
$$;