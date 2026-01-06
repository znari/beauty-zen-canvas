-- Drop existing functions to change return type
DROP FUNCTION IF EXISTS public.get_public_procedures(uuid);
DROP FUNCTION IF EXISTS public.get_booking_settings_by_slug(text);

-- Recreate get_public_procedures: remove duration_minutes, add description
CREATE FUNCTION public.get_public_procedures(p_professional_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.name,
    pr.price,
    pr.description
  FROM public.procedures pr
  WHERE pr.professional_id = p_professional_id
    AND pr.active = true
  ORDER BY pr.name;
END;
$$;

-- Recreate get_booking_settings_by_slug: add avatar_url, phone, location, is_enabled
CREATE FUNCTION public.get_booking_settings_by_slug(p_slug text)
RETURNS TABLE(
  professional_id uuid,
  studio_name text,
  avatar_url text,
  phone text,
  address_city text,
  address_state text,
  welcome_message text,
  min_advance_hours integer,
  max_advance_days integer,
  slot_duration_minutes integer,
  working_hours jsonb,
  blocked_dates jsonb,
  require_approval boolean,
  is_enabled boolean
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
    p.avatar_url,
    p.phone_raw as phone,
    p.address_city,
    p.address_state,
    bs.welcome_message,
    COALESCE(bs.min_advance_hours, 24),
    COALESCE(bs.max_advance_days, 30),
    COALESCE(bs.slot_duration_minutes, 60),
    COALESCE(bs.working_hours, '{}'::jsonb),
    COALESCE(bs.blocked_dates, '[]'::jsonb),
    COALESCE(bs.require_approval, true),
    bs.is_enabled
  FROM public.booking_settings bs
  JOIN public.profiles p ON p.id = bs.professional_id
  WHERE bs.booking_slug = p_slug;
END;
$$;