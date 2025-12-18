-- Função para notificar admins quando novo parceiro se cadastra
CREATE OR REPLACE FUNCTION public.notify_admin_new_partner()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Buscar todos os admins e criar notificação para cada
  FOR admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (
      professional_id,
      type,
      title,
      message
    ) VALUES (
      admin_record.user_id,
      'new_partner_application',
      '🤝 Nova solicitação de parceiro',
      NEW.name || ' (' || NEW.email || ') solicitou ser parceiro'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger que dispara quando novo parceiro é inserido com status pending
CREATE TRIGGER on_new_partner_registration
AFTER INSERT ON public.partners
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION public.notify_admin_new_partner();