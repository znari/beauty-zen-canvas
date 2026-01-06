-- Enable unaccent extension if not already enabled
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Function to create default booking_settings on profile creation
CREATE OR REPLACE FUNCTION public.create_default_booking_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INT := 1;
BEGIN
  -- Generate base slug from studio_name or full_name
  v_base_slug := lower(
    regexp_replace(
      regexp_replace(
        unaccent(COALESCE(NEW.studio_name, NEW.full_name, 'meu-studio')),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
  
  -- Ensure minimum length
  IF length(v_base_slug) < 3 THEN
    v_base_slug := 'meu-studio';
  END IF;
  
  v_final_slug := v_base_slug;
  
  -- Check for duplicates
  WHILE EXISTS (
    SELECT 1 FROM booking_settings 
    WHERE booking_slug = v_final_slug
  ) LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_base_slug || '-' || v_counter;
  END LOOP;
  
  -- Create default record
  INSERT INTO booking_settings (
    professional_id,
    is_enabled,
    booking_slug,
    min_advance_hours,
    max_advance_days,
    slot_duration_minutes,
    require_approval,
    working_hours
  ) VALUES (
    NEW.id,
    false,
    v_final_slug,
    24,
    30,
    60,
    true,
    '{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"13:00"},"sunday":{"enabled":false,"start":"09:00","end":"13:00"}}'::jsonb
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create booking_settings after profile insertion
DROP TRIGGER IF EXISTS create_booking_settings_on_profile ON public.profiles;
CREATE TRIGGER create_booking_settings_on_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_booking_settings();

-- Function to sync booking_slug when studio_name changes
CREATE OR REPLACE FUNCTION public.sync_booking_slug_on_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INT := 1;
BEGIN
  -- Only update if studio_name changed
  IF NEW.studio_name IS DISTINCT FROM OLD.studio_name THEN
    v_base_slug := lower(
      regexp_replace(
        regexp_replace(
          unaccent(COALESCE(NEW.studio_name, NEW.full_name, 'meu-studio')),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
    
    IF length(v_base_slug) < 3 THEN
      v_base_slug := 'meu-studio';
    END IF;
    
    v_final_slug := v_base_slug;
    
    WHILE EXISTS (
      SELECT 1 FROM booking_settings 
      WHERE booking_slug = v_final_slug 
      AND professional_id != NEW.id
    ) LOOP
      v_counter := v_counter + 1;
      v_final_slug := v_base_slug || '-' || v_counter;
    END LOOP;
    
    UPDATE booking_settings
    SET booking_slug = v_final_slug
    WHERE professional_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to sync slug on profile update
DROP TRIGGER IF EXISTS sync_booking_slug_on_profile_update ON public.profiles;
CREATE TRIGGER sync_booking_slug_on_profile_update
AFTER UPDATE OF studio_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_booking_slug_on_profile_update();

-- Backfill: Create booking_settings for existing profiles that don't have one
DO $$
DECLARE
  profile_rec RECORD;
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INT;
BEGIN
  FOR profile_rec IN 
    SELECT p.id, p.studio_name, p.full_name
    FROM profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM booking_settings bs WHERE bs.professional_id = p.id
    )
  LOOP
    v_counter := 1;
    
    v_base_slug := lower(
      regexp_replace(
        regexp_replace(
          unaccent(COALESCE(profile_rec.studio_name, profile_rec.full_name, 'meu-studio')),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
    
    IF length(v_base_slug) < 3 THEN
      v_base_slug := 'meu-studio';
    END IF;
    
    v_final_slug := v_base_slug;
    
    WHILE EXISTS (
      SELECT 1 FROM booking_settings 
      WHERE booking_slug = v_final_slug
    ) LOOP
      v_counter := v_counter + 1;
      v_final_slug := v_base_slug || '-' || v_counter;
    END LOOP;
    
    INSERT INTO booking_settings (
      professional_id,
      is_enabled,
      booking_slug,
      min_advance_hours,
      max_advance_days,
      slot_duration_minutes,
      require_approval,
      working_hours
    ) VALUES (
      profile_rec.id,
      false,
      v_final_slug,
      24,
      30,
      60,
      true,
      '{"monday":{"enabled":true,"start":"09:00","end":"18:00"},"tuesday":{"enabled":true,"start":"09:00","end":"18:00"},"wednesday":{"enabled":true,"start":"09:00","end":"18:00"},"thursday":{"enabled":true,"start":"09:00","end":"18:00"},"friday":{"enabled":true,"start":"09:00","end":"18:00"},"saturday":{"enabled":false,"start":"09:00","end":"13:00"},"sunday":{"enabled":false,"start":"09:00","end":"13:00"}}'::jsonb
    );
  END LOOP;
END $$;