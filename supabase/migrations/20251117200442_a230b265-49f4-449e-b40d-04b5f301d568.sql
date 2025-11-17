-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  anamnesis_id UUID REFERENCES public.anamneses(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'anamnesis_filled',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_notifications_professional_id ON public.notifications(professional_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_for_professional"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "notifications_update_for_professional"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Habilitar realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger para criar notificação quando anamnese é preenchida
CREATE OR REPLACE FUNCTION public.notify_anamnesis_filled()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_anamnesis_filled
  AFTER INSERT OR UPDATE ON public.anamneses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_anamnesis_filled();

COMMENT ON TABLE public.notifications IS 'Notificações do sistema para profissionais';
COMMENT ON FUNCTION public.notify_anamnesis_filled() IS 'Cria notificação quando cliente preenche ficha de anamnese';