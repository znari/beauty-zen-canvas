-- Remove a política RESTRICTIVE existente
DROP POLICY IF EXISTS "partners_insert_registration" ON public.partners;

-- Cria uma nova política PERMISSIVE para permitir cadastro público
CREATE POLICY "partners_insert_public" 
ON public.partners
FOR INSERT
TO anon, authenticated
WITH CHECK (true);