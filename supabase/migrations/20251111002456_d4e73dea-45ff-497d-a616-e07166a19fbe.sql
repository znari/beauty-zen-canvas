-- Atualizar bucket para privado
UPDATE storage.buckets 
SET public = false 
WHERE id = 'profile-avatars';

-- Remover política pública de visualização
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Nova política: Apenas usuários autenticados podem ver seus próprios avatares
CREATE POLICY "Users can view their own avatar"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuários podem ver avatares de outros usuários (mas precisa estar autenticado)
CREATE POLICY "Authenticated users can view all avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'profile-avatars');