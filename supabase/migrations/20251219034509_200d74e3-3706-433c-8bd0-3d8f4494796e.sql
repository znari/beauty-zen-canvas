-- Drop the existing restrictive policy
DROP POLICY IF EXISTS partners_insert_public ON public.partners;

-- Create a new PERMISSIVE policy (default is permissive)
CREATE POLICY partners_insert_public ON public.partners
  FOR INSERT
  WITH CHECK (true);