-- Add cpf_cnpj column to profiles table
ALTER TABLE public.profiles
ADD COLUMN cpf_cnpj text UNIQUE;

-- Update the handle_new_user function to include cpf_cnpj
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    studio_name, 
    phone_raw, 
    phone_normalized,
    cpf_cnpj,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'studio_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    public.normalize_phone(COALESCE(NEW.raw_user_meta_data->>'phone', '')),
    COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$function$;