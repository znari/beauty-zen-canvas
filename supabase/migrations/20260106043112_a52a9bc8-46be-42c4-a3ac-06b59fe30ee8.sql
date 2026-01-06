-- Dropar função existente para alterar tipo de retorno
DROP FUNCTION IF EXISTS public.get_booking_settings_by_slug(text);

-- Recriar função RPC com require_approval
CREATE OR REPLACE FUNCTION public.get_booking_settings_by_slug(p_slug text)
RETURNS TABLE(
  professional_id uuid,
  studio_name text,
  welcome_message text,
  min_advance_hours integer,
  max_advance_days integer,
  slot_duration_minutes integer,
  working_hours jsonb,
  blocked_dates jsonb,
  require_approval boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.professional_id,
    COALESCE(p.studio_name, p.full_name) as studio_name,
    bs.welcome_message,
    COALESCE(bs.min_advance_hours, 24) as min_advance_hours,
    COALESCE(bs.max_advance_days, 30) as max_advance_days,
    COALESCE(bs.slot_duration_minutes, 60) as slot_duration_minutes,
    COALESCE(bs.working_hours, '{}'::jsonb) as working_hours,
    COALESCE(bs.blocked_dates, '[]'::jsonb) as blocked_dates,
    COALESCE(bs.require_approval, true) as require_approval
  FROM public.booking_settings bs
  JOIN public.profiles p ON p.id = bs.professional_id
  WHERE bs.booking_slug = p_slug
    AND bs.is_enabled = true;
END;
$$;