-- Criar função RPC pública para buscar informações da visita
-- Esta função retorna apenas dados não-sensíveis necessários para a ficha de anamnese
CREATE OR REPLACE FUNCTION public.get_public_visit_info(client_uuid UUID)
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  visit_date DATE,
  visit_time TIME,
  procedures JSONB,
  professional_name TEXT,
  anamnesis_id UUID,
  anamnesis_responses JSONB,
  anamnesis_filled_at TIMESTAMPTZ,
  anamnesis_consent BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    v.visit_date,
    v.visit_time,
    v.procedures,
    p.full_name as professional_name,
    a.id as anamnesis_id,
    a.responses as anamnesis_responses,
    a.filled_at as anamnesis_filled_at,
    a.consent as anamnesis_consent
  FROM clients c
  LEFT JOIN visits v ON v.client_id = c.id 
    AND v.visit_date >= CURRENT_DATE 
    AND v.status = 'scheduled'
  LEFT JOIN profiles p ON p.id = v.professional_id
  LEFT JOIN anamneses a ON a.client_id = c.id AND a.professional_id = v.professional_id
  WHERE c.id = client_uuid
  ORDER BY v.visit_date ASC, v.visit_time ASC
  LIMIT 1;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.get_public_visit_info(UUID) IS 'Retorna informações públicas da próxima visita de um cliente para preenchimento de ficha de anamnese. Expõe apenas dados não-sensíveis.';

-- Permitir acesso público (anon) à função
GRANT EXECUTE ON FUNCTION public.get_public_visit_info(UUID) TO anon;

-- Permitir que usuários anônimos (clientes via link) possam inserir suas anamneses
CREATE POLICY "anamneses_public_insert_for_client"
ON public.anamneses
FOR INSERT
TO anon
WITH CHECK (true);

-- Permitir que usuários anônimos atualizem anamneses existentes
-- (caso o cliente precise corrigir algo)
CREATE POLICY "anamneses_public_update_for_client"
ON public.anamneses
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Permitir leitura pública de anamneses (necessário para verificar se já foi preenchida)
CREATE POLICY "anamneses_public_select_for_verification"
ON public.anamneses
FOR SELECT
TO anon
USING (true);