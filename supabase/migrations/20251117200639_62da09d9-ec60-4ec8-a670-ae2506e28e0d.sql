-- Corrigir search_path da função notify_anamnesis_filled
CREATE OR REPLACE FUNCTION public.notify_anamnesis_filled()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_name TEXT;
BEGIN
  -- Só criar notificação se filled_at mudou de NULL para NOT NULL
  IF (TG_OP = 'UPDATE' AND OLD.filled_at IS NULL AND NEW.filled_at IS NOT NULL) OR
     (TG_OP = 'INSERT' AND NEW.filled_at IS NOT NULL) THEN
    
    -- Buscar nome do cliente
    SELECT name INTO client_name
    FROM public.clients
    WHERE id = NEW.client_id;
    
    -- Criar notificação
    INSERT INTO public.notifications (
      professional_id,
      client_id,
      anamnesis_id,
      type,
      title,
      message
    ) VALUES (
      NEW.professional_id,
      NEW.client_id,
      NEW.id,
      'anamnesis_filled',
      'Ficha preenchida',
      client_name || ' preencheu a ficha de anamnese'
    );
  END IF;
  
  RETURN NEW;
END;
$$;