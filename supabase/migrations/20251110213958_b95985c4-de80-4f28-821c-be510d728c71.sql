-- Adicionar coluna avatar_url na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);

-- Criar bucket de storage para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket profile-avatars

-- Política: Usuários autenticados podem fazer upload de suas próprias fotos
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuários autenticados podem atualizar suas próprias fotos
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuários autenticados podem deletar suas próprias fotos
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Todos podem visualizar avatares (bucket público)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');