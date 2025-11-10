-- Criar bucket para fotos de visitas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visit-photos',
  'visit-photos',
  true,
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Política: Profissionais podem ver suas próprias fotos
CREATE POLICY "Profissionais podem visualizar suas fotos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM visits 
    WHERE professional_id = auth.uid()
  )
);

-- Política: Profissionais podem fazer upload de fotos
CREATE POLICY "Profissionais podem fazer upload de fotos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'visit-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM visits 
    WHERE professional_id = auth.uid()
  )
);

-- Política: Profissionais podem deletar suas fotos
CREATE POLICY "Profissionais podem deletar suas fotos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'visit-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM visits 
    WHERE professional_id = auth.uid()
  )
);

-- Política: Profissionais podem atualizar suas fotos
CREATE POLICY "Profissionais podem atualizar suas fotos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'visit-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM visits 
    WHERE professional_id = auth.uid()
  )
);