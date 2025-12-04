-- Tornar bucket visit-photos privado para segurança
UPDATE storage.buckets 
SET public = false 
WHERE id = 'visit-photos';