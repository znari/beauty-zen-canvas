-- Adicionar coluna visit_id na tabela notifications
ALTER TABLE public.notifications 
ADD COLUMN visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX idx_notifications_visit_id ON public.notifications(visit_id);

-- Comentário
COMMENT ON COLUMN public.notifications.visit_id IS 'Referência à visita relacionada à notificação';

-- Função auxiliar para formatar data e hora
CREATE OR REPLACE FUNCTION public.format_visit_datetime(
  p_date DATE,
  p_time TIME
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN to_char(p_date, 'DD/MM/YYYY') || ' às ' || to_char(p_time, 'HH24:MI');
END;
$$;

COMMENT ON FUNCTION public.format_visit_datetime IS 'Formata data e hora de visita para exibição';

-- Função para notificar novo agendamento
CREATE OR REPLACE FUNCTION public.notify_visit_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_name TEXT;
  visit_datetime TEXT;
BEGIN
  -- Buscar nome do cliente
  SELECT name INTO client_name
  FROM public.clients
  WHERE id = NEW.client_id;
  
  -- Formatar data e hora
  visit_datetime := public.format_visit_datetime(NEW.visit_date, NEW.visit_time);
  
  -- Criar notificação
  INSERT INTO public.notifications (
    professional_id,
    client_id,
    visit_id,
    type,
    title,
    message
  ) VALUES (
    NEW.professional_id,
    NEW.client_id,
    NEW.id,
    'visit_created',
    'Novo agendamento',
    client_name || ' tem nova visita agendada para ' || visit_datetime
  );
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_visit_created() IS 'Cria notificação quando nova visita é agendada';

-- Criar trigger para novo agendamento
CREATE TRIGGER trigger_notify_visit_created
  AFTER INSERT ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_visit_created();

-- Função para notificar cancelamento
CREATE OR REPLACE FUNCTION public.notify_visit_cancelled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_name TEXT;
  visit_datetime TEXT;
BEGIN
  -- Só notificar se status mudou para 'cancelled'
  IF (OLD.status != 'cancelled' AND NEW.status = 'cancelled') THEN
    
    -- Buscar nome do cliente
    SELECT name INTO client_name
    FROM public.clients
    WHERE id = NEW.client_id;
    
    -- Formatar data e hora
    visit_datetime := public.format_visit_datetime(NEW.visit_date, NEW.visit_time);
    
    -- Criar notificação
    INSERT INTO public.notifications (
      professional_id,
      client_id,
      visit_id,
      type,
      title,
      message
    ) VALUES (
      NEW.professional_id,
      NEW.client_id,
      NEW.id,
      'visit_cancelled',
      'Visita cancelada',
      client_name || ' cancelou a visita de ' || visit_datetime
    );
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_visit_cancelled() IS 'Cria notificação quando visita é cancelada';

-- Criar trigger para cancelamento
CREATE TRIGGER trigger_notify_visit_cancelled
  AFTER UPDATE ON public.visits
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
  EXECUTE FUNCTION public.notify_visit_cancelled();

-- Função para notificar reagendamento
CREATE OR REPLACE FUNCTION public.notify_visit_rescheduled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_name TEXT;
  old_datetime TEXT;
  new_datetime TEXT;
BEGIN
  -- Só notificar se data OU hora mudou (e não é cancelamento)
  IF (OLD.visit_date != NEW.visit_date OR OLD.visit_time != NEW.visit_time) AND NEW.status != 'cancelled' THEN
    
    -- Buscar nome do cliente
    SELECT name INTO client_name
    FROM public.clients
    WHERE id = NEW.client_id;
    
    -- Formatar datas antigas e novas
    old_datetime := public.format_visit_datetime(OLD.visit_date, OLD.visit_time);
    new_datetime := public.format_visit_datetime(NEW.visit_date, NEW.visit_time);
    
    -- Criar notificação
    INSERT INTO public.notifications (
      professional_id,
      client_id,
      visit_id,
      type,
      title,
      message
    ) VALUES (
      NEW.professional_id,
      NEW.client_id,
      NEW.id,
      'visit_rescheduled',
      'Visita reagendada',
      client_name || ' reagendou de ' || old_datetime || ' para ' || new_datetime
    );
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_visit_rescheduled() IS 'Cria notificação quando visita é reagendada';

-- Criar trigger para reagendamento
CREATE TRIGGER trigger_notify_visit_rescheduled
  AFTER UPDATE ON public.visits
  FOR EACH ROW
  WHEN (
    (NEW.visit_date IS DISTINCT FROM OLD.visit_date) OR 
    (NEW.visit_time IS DISTINCT FROM OLD.visit_time)
  )
  EXECUTE FUNCTION public.notify_visit_rescheduled();