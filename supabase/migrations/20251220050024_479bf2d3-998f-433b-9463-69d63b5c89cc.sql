-- Create function to check partner email existence (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_partner_email_exists(p_email TEXT)
RETURNS TABLE (email_exists BOOLEAN, email_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as email_exists,
    p.status as email_status
  FROM public.partners p
  WHERE LOWER(p.email) = LOWER(p_email)
  LIMIT 1;
  
  -- If no rows returned, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT;
  END IF;
END;
$$;