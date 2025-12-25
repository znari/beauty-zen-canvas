-- Tabela de configurações de agendamento online
CREATE TABLE public.booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  booking_slug TEXT UNIQUE,
  min_advance_hours INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 30,
  slot_duration_minutes INTEGER DEFAULT 60,
  working_hours JSONB DEFAULT '{
    "monday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "thursday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "friday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "saturday": {"enabled": false, "start": "09:00", "end": "13:00"},
    "sunday": {"enabled": false, "start": "09:00", "end": "13:00"}
  }'::jsonb,
  blocked_dates JSONB DEFAULT '[]'::jsonb,
  require_approval BOOLEAN DEFAULT true,
  welcome_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de solicitações de agendamento
CREATE TABLE public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  procedure_id UUID NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  assigned_professional_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  converted_visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
  converted_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies para booking_settings

-- Qualquer um pode visualizar configurações ativas (para página pública)
CREATE POLICY "Configurações públicas são visíveis"
ON public.booking_settings
FOR SELECT
USING (is_enabled = true);

-- Profissionais podem gerenciar suas próprias configurações
CREATE POLICY "Profissionais podem gerenciar suas configurações"
ON public.booking_settings
FOR ALL
USING (auth.uid() = professional_id)
WITH CHECK (auth.uid() = professional_id);

-- RLS Policies para booking_requests

-- Clientes podem criar solicitações (público)
CREATE POLICY "Qualquer um pode criar solicitações"
ON public.booking_requests
FOR INSERT
WITH CHECK (true);

-- Profissionais podem visualizar suas solicitações
CREATE POLICY "Profissionais podem ver suas solicitações"
ON public.booking_requests
FOR SELECT
USING (auth.uid() = professional_id);

-- Profissionais podem atualizar suas solicitações
CREATE POLICY "Profissionais podem atualizar suas solicitações"
ON public.booking_requests
FOR UPDATE
USING (auth.uid() = professional_id);

-- Índices para performance
CREATE INDEX idx_booking_settings_slug ON public.booking_settings(booking_slug);
CREATE INDEX idx_booking_requests_professional ON public.booking_requests(professional_id);
CREATE INDEX idx_booking_requests_status ON public.booking_requests(status);
CREATE INDEX idx_booking_requests_date ON public.booking_requests(requested_date);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_booking_settings_updated_at
BEFORE UPDATE ON public.booking_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_column();

-- Função para notificar profissional sobre nova solicitação
CREATE OR REPLACE FUNCTION public.notify_booking_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (
    professional_id,
    type,
    title,
    message
  ) VALUES (
    NEW.professional_id,
    'booking_request',
    '📅 Nova solicitação de agendamento',
    NEW.client_name || ' solicitou agendamento para ' || to_char(NEW.requested_date, 'DD/MM/YYYY') || ' às ' || to_char(NEW.requested_time, 'HH24:MI')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para notificar
CREATE TRIGGER notify_new_booking_request
AFTER INSERT ON public.booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_request();

-- Função pública para buscar configurações pelo slug
CREATE OR REPLACE FUNCTION public.get_booking_settings_by_slug(p_slug TEXT)
RETURNS TABLE (
  professional_id UUID,
  studio_name TEXT,
  welcome_message TEXT,
  min_advance_hours INTEGER,
  max_advance_days INTEGER,
  slot_duration_minutes INTEGER,
  working_hours JSONB,
  blocked_dates JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.professional_id,
    p.studio_name,
    bs.welcome_message,
    bs.min_advance_hours,
    bs.max_advance_days,
    bs.slot_duration_minutes,
    bs.working_hours,
    bs.blocked_dates
  FROM public.booking_settings bs
  JOIN public.profiles p ON p.id = bs.professional_id
  WHERE bs.booking_slug = p_slug AND bs.is_enabled = true;
END;
$$;

-- Função para buscar procedimentos públicos de um profissional
CREATE OR REPLACE FUNCTION public.get_public_procedures(p_professional_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  duration_minutes INTEGER
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
    pr.duration_minutes
  FROM public.procedures pr
  WHERE pr.professional_id = p_professional_id
  ORDER BY pr.name;
END;
$$;

-- Função para buscar equipe pública de um profissional
CREATE OR REPLACE FUNCTION public.get_public_team_members(p_professional_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialty TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id,
    tm.name,
    tm.specialty
  FROM public.team_members tm
  WHERE tm.owner_id = p_professional_id AND tm.is_active = true
  ORDER BY tm.is_owner DESC, tm.name;
END;
$$;

-- Função para buscar horários ocupados em uma data
CREATE OR REPLACE FUNCTION public.get_booked_slots(
  p_professional_id UUID,
  p_date DATE,
  p_team_member_id UUID DEFAULT NULL
)
RETURNS TABLE (
  start_time TIME,
  end_time TIME
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.visit_time as start_time,
    (v.visit_time + INTERVAL '1 hour') as end_time
  FROM public.visits v
  WHERE v.professional_id = p_professional_id
    AND v.visit_date = p_date
    AND v.status = 'scheduled'
    AND (p_team_member_id IS NULL OR v.assigned_professional_id = p_team_member_id)
  
  UNION ALL
  
  SELECT 
    br.requested_time as start_time,
    (br.requested_time + INTERVAL '1 hour') as end_time
  FROM public.booking_requests br
  WHERE br.professional_id = p_professional_id
    AND br.requested_date = p_date
    AND br.status = 'pending'
    AND (p_team_member_id IS NULL OR br.assigned_professional_id = p_team_member_id)
  
  ORDER BY start_time;
END;
$$;