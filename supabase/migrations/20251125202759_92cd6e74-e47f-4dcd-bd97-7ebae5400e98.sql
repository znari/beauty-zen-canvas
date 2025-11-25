-- Create team_members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  specialty text,
  avatar_url text,
  is_active boolean DEFAULT true,
  is_owner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "team_members_select_own" ON public.team_members
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "team_members_insert_own" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "team_members_update_own" ON public.team_members
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "team_members_delete_non_owner" ON public.team_members
  FOR DELETE USING (auth.uid() = owner_id AND is_owner = false);

-- Add assigned_professional_id to visits
ALTER TABLE public.visits 
  ADD COLUMN assigned_professional_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_column();

-- Function to create owner as first team member
CREATE OR REPLACE FUNCTION public.create_owner_as_team_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_members (owner_id, name, email, is_owner, is_active)
  VALUES (
    NEW.id,
    NEW.full_name,
    NEW.email,
    true,
    true
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create team member on profile creation
CREATE TRIGGER on_profile_created_team_member
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_owner_as_team_member();

-- Migrate existing users: create owner team member for all existing profiles
INSERT INTO public.team_members (owner_id, name, email, is_owner, is_active)
SELECT p.id, p.full_name, p.email, true, true
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_members tm WHERE tm.owner_id = p.id AND tm.is_owner = true
);