-- Create function to get detailed user data for admin dashboard
CREATE OR REPLACE FUNCTION public.get_admin_users_detailed()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  studio_name text,
  plan text,
  subscription_status text,
  trial_ends_at timestamp with time zone,
  subscription_ends_at timestamp with time zone,
  created_at timestamp with time zone,
  client_count integer,
  team_count integer,
  visit_count integer,
  completed_visit_count integer,
  total_revenue numeric,
  anamnesis_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver estes dados';
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
    p.created_at,
    COALESCE((SELECT COUNT(*)::INTEGER FROM clients c WHERE c.professional_id = p.id), 0) as client_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM team_members tm WHERE tm.owner_id = p.id), 0) as team_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM visits v WHERE v.professional_id = p.id), 0) as visit_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM visits v WHERE v.professional_id = p.id AND v.status = 'completed'), 0) as completed_visit_count,
    COALESCE((SELECT SUM(v.price_total)::NUMERIC FROM visits v WHERE v.professional_id = p.id AND v.status = 'completed'), 0) as total_revenue,
    COALESCE((SELECT COUNT(*)::INTEGER FROM anamneses a WHERE a.professional_id = p.id AND a.filled_at IS NOT NULL), 0) as anamnesis_count
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$function$;

-- Create function to terminate all user sessions (for admin use)
CREATE OR REPLACE FUNCTION public.admin_terminate_all_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_count INTEGER;
BEGIN
  -- This function should only be called via edge function with service role
  -- Count sessions before deletion
  SELECT COUNT(*) INTO session_count FROM auth.sessions;
  
  -- Delete all sessions
  DELETE FROM auth.sessions;
  
  RETURN session_count;
END;
$function$;