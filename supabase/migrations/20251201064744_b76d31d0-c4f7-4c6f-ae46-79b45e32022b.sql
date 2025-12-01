-- ============================================
-- CORREÇÃO DE SEGURANÇA: Anamneses Públicas
-- ============================================
-- Remove políticas RLS abertas e cria função RPC segura

-- 1. Criar função RPC SECURITY DEFINER para submissão pública de anamnese
CREATE OR REPLACE FUNCTION public.submit_public_anamnesis(
  p_client_id uuid,
  p_responses jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visit record;
  v_anamnesis_id uuid;
  v_result jsonb;
BEGIN
  -- Validar que o cliente existe e tem visita agendada
  SELECT v.professional_id, v.id as visit_id INTO v_visit
  FROM visits v
  JOIN clients c ON c.id = v.client_id
  WHERE c.id = p_client_id
  AND v.status = 'scheduled'
  AND v.visit_date >= CURRENT_DATE
  ORDER BY v.visit_date ASC, v.visit_time ASC
  LIMIT 1;
  
  IF v_visit IS NULL THEN
    RAISE EXCEPTION 'Cliente não encontrado ou sem visita agendada';
  END IF;
  
  -- Verificar se já existe anamnese para este cliente
  SELECT id INTO v_anamnesis_id 
  FROM anamneses 
  WHERE client_id = p_client_id AND professional_id = v_visit.professional_id;
  
  IF v_anamnesis_id IS NOT NULL THEN
    -- Atualizar anamnese existente
    UPDATE anamneses SET 
      responses = p_responses,
      consent = true,
      filled_at = NOW(),
      updated_at = NOW()
    WHERE id = v_anamnesis_id;
    
    v_result := jsonb_build_object('success', true, 'action', 'updated', 'anamnesis_id', v_anamnesis_id);
  ELSE
    -- Criar nova anamnese
    INSERT INTO anamneses (professional_id, client_id, responses, consent, filled_at)
    VALUES (v_visit.professional_id, p_client_id, p_responses, true, NOW())
    RETURNING id INTO v_anamnesis_id;
    
    v_result := jsonb_build_object('success', true, 'action', 'created', 'anamnesis_id', v_anamnesis_id);
  END IF;
  
  RETURN v_result;
END;
$$;

-- 2. Remover políticas RLS públicas perigosas
DROP POLICY IF EXISTS anamneses_public_select_for_verification ON anamneses;
DROP POLICY IF EXISTS anamneses_public_insert_for_client ON anamneses;
DROP POLICY IF EXISTS anamneses_public_update_for_client ON anamneses;