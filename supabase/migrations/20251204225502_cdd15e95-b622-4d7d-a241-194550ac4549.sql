-- Deletar todos os profiles exceto igormartins10031@gmail.com
-- (cascade vai limpar dados relacionados automaticamente)
DELETE FROM public.profiles 
WHERE email != 'igormartins10031@gmail.com';

-- Configurar igormartins10031@gmail.com como admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM public.profiles 
WHERE email = 'igormartins10031@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;