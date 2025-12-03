-- Dropar função existente e recriar com novo retorno
DROP FUNCTION IF EXISTS public.get_public_visit_info(uuid);

CREATE FUNCTION public.get_public_visit_info(client_uuid uuid)
 RETURNS TABLE(client_id uuid, client_name text, visit_date date, visit_time time without time zone, procedures jsonb, professional_name text, studio_name text, anamnesis_id uuid, anamnesis_responses jsonb, anamnesis_filled_at timestamp with time zone, anamnesis_consent boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    v.visit_date,
    v.visit_time,
    v.procedures,
    COALESCE(tm.name, p.full_name) as professional_name,
    p.studio_name,
    a.id as anamnesis_id,
    a.responses as anamnesis_responses,
    a.filled_at as anamnesis_filled_at,
    a.consent as anamnesis_consent
  FROM clients c
  LEFT JOIN visits v ON v.client_id = c.id 
    AND v.visit_date >= CURRENT_DATE 
    AND v.status = 'scheduled'
  LEFT JOIN profiles p ON p.id = v.professional_id
  LEFT JOIN team_members tm ON tm.id = v.assigned_professional_id
  LEFT JOIN anamneses a ON a.client_id = c.id AND a.professional_id = v.professional_id
  WHERE c.id = client_uuid
  ORDER BY v.visit_date ASC, v.visit_time ASC
  LIMIT 1;
END;
$function$;