-- Permitir profissional deletar suas próprias notificações
CREATE POLICY "notifications_delete_for_professional"
ON public.notifications
FOR DELETE
USING (auth.uid() = professional_id);

-- Adicionar comentário
COMMENT ON POLICY "notifications_delete_for_professional" ON public.notifications 
IS 'Permite que profissional delete suas próprias notificações';