-- Adicionar campos de endereço na tabela profiles
ALTER TABLE profiles
  ADD COLUMN address_cep TEXT,
  ADD COLUMN address_street TEXT,
  ADD COLUMN address_number TEXT,
  ADD COLUMN address_complement TEXT,
  ADD COLUMN address_neighborhood TEXT,
  ADD COLUMN address_city TEXT,
  ADD COLUMN address_state TEXT;

-- Comentários para documentação
COMMENT ON COLUMN profiles.address_cep IS 'CEP do endereço (formato: 00000-000)';
COMMENT ON COLUMN profiles.address_street IS 'Logradouro/Rua';
COMMENT ON COLUMN profiles.address_number IS 'Número do endereço';
COMMENT ON COLUMN profiles.address_complement IS 'Complemento (opcional)';
COMMENT ON COLUMN profiles.address_neighborhood IS 'Bairro';
COMMENT ON COLUMN profiles.address_city IS 'Cidade';
COMMENT ON COLUMN profiles.address_state IS 'Estado (UF)';