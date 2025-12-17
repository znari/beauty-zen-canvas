-- ===========================================
-- PARTNER/AFFILIATE SYSTEM TABLES
-- ===========================================

-- Partners table (affiliate accounts)
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if not a FichaZen subscriber
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
  rejection_reason TEXT,
  commission_value NUMERIC NOT NULL DEFAULT 20.00,
  total_referrals INTEGER DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  pending_balance NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table (tracked signups)
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'paid', 'commission_pending', 'commission_paid')),
  first_payment_at TIMESTAMPTZ,
  commission_amount NUMERIC,
  commission_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner payouts history
CREATE TABLE public.partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  referral_ids UUID[] NOT NULL,
  paid_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Add referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.partners(id);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_partners_status ON public.partners(status);
CREATE INDEX idx_partners_referral_code ON public.partners(referral_code);
CREATE INDEX idx_partners_user_id ON public.partners(user_id);
CREATE INDEX idx_referrals_partner_id ON public.referrals(partner_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

-- Partners: users can see their own partner record
CREATE POLICY "partners_select_own" ON public.partners
  FOR SELECT USING (user_id = auth.uid());

-- Partners: users can update their own partner record (only certain fields)
CREATE POLICY "partners_update_own" ON public.partners
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Partners: anyone can insert (registration)
CREATE POLICY "partners_insert_registration" ON public.partners
  FOR INSERT WITH CHECK (true);

-- Partners: public can see active partners (for referral code validation)
CREATE POLICY "partners_select_active_public" ON public.partners
  FOR SELECT USING (status = 'active');

-- Referrals: partners can see their own referrals
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Partner payouts: partners can see their own payouts
CREATE POLICY "partner_payouts_select_own" ON public.partner_payouts
  FOR SELECT USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 6 character code
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  -- Check if exists, regenerate if needed
  WHILE EXISTS (SELECT 1 FROM public.partners WHERE referral_code = code) LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
  END LOOP;
  
  RETURN code;
END;
$$;

-- ===========================================
-- ADMIN RPC FUNCTIONS (SECURITY DEFINER)
-- ===========================================

-- Get all partners (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_partners()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  pix_key TEXT,
  pix_key_type TEXT,
  referral_code TEXT,
  status TEXT,
  rejection_reason TEXT,
  commission_value NUMERIC,
  total_referrals INTEGER,
  total_paid NUMERIC,
  pending_balance NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  RETURN QUERY SELECT 
    p.id, p.user_id, p.name, p.email, p.phone, p.pix_key, p.pix_key_type,
    p.referral_code, p.status, p.rejection_reason, p.commission_value,
    p.total_referrals, p.total_paid, p.pending_balance, p.notes,
    p.created_at, p.updated_at
  FROM public.partners p
  ORDER BY p.created_at DESC;
END;
$$;

-- Approve partner (admin only)
CREATE OR REPLACE FUNCTION public.admin_approve_partner(p_partner_id UUID, p_commission_value NUMERIC DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  -- Generate referral code if not exists
  SELECT referral_code INTO v_code FROM public.partners WHERE id = p_partner_id;
  IF v_code IS NULL OR v_code = '' THEN
    v_code := public.generate_referral_code();
  END IF;
  
  UPDATE public.partners SET
    status = 'active',
    referral_code = v_code,
    commission_value = COALESCE(p_commission_value, commission_value),
    updated_at = NOW()
  WHERE id = p_partner_id;
  
  RETURN json_build_object('success', true, 'referral_code', v_code);
END;
$$;

-- Reject partner (admin only)
CREATE OR REPLACE FUNCTION public.admin_reject_partner(p_partner_id UUID, p_reason TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  UPDATE public.partners SET
    status = 'rejected',
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_partner_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Suspend partner (admin only)
CREATE OR REPLACE FUNCTION public.admin_suspend_partner(p_partner_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  UPDATE public.partners SET
    status = 'suspended',
    notes = COALESCE(p_reason, notes),
    updated_at = NOW()
  WHERE id = p_partner_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Get pending commissions (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_pending_commissions()
RETURNS TABLE (
  referral_id UUID,
  partner_id UUID,
  partner_name TEXT,
  partner_email TEXT,
  partner_pix_key TEXT,
  partner_pix_key_type TEXT,
  referred_email TEXT,
  commission_amount NUMERIC,
  first_payment_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  RETURN QUERY SELECT 
    r.id as referral_id,
    r.partner_id,
    p.name as partner_name,
    p.email as partner_email,
    p.pix_key as partner_pix_key,
    p.pix_key_type as partner_pix_key_type,
    r.referred_email,
    r.commission_amount,
    r.first_payment_at
  FROM public.referrals r
  JOIN public.partners p ON p.id = r.partner_id
  WHERE r.status = 'commission_pending'
  ORDER BY r.first_payment_at ASC;
END;
$$;

-- Mark commissions as paid (admin only)
CREATE OR REPLACE FUNCTION public.admin_pay_commissions(p_referral_ids UUID[], p_notes TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id UUID;
  v_total NUMERIC := 0;
  v_pix_key TEXT;
  v_pix_key_type TEXT;
  v_payout_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  -- Get partner info from first referral
  SELECT r.partner_id, p.pix_key, p.pix_key_type INTO v_partner_id, v_pix_key, v_pix_key_type
  FROM public.referrals r
  JOIN public.partners p ON p.id = r.partner_id
  WHERE r.id = p_referral_ids[1];
  
  -- Calculate total
  SELECT COALESCE(SUM(commission_amount), 0) INTO v_total
  FROM public.referrals
  WHERE id = ANY(p_referral_ids);
  
  -- Create payout record
  INSERT INTO public.partner_payouts (partner_id, amount, pix_key, pix_key_type, referral_ids, paid_by, notes)
  VALUES (v_partner_id, v_total, v_pix_key, v_pix_key_type, p_referral_ids, auth.uid(), p_notes)
  RETURNING id INTO v_payout_id;
  
  -- Update referrals
  UPDATE public.referrals SET
    status = 'commission_paid',
    commission_paid_at = NOW()
  WHERE id = ANY(p_referral_ids);
  
  -- Update partner totals
  UPDATE public.partners SET
    total_paid = total_paid + v_total,
    pending_balance = pending_balance - v_total,
    updated_at = NOW()
  WHERE id = v_partner_id;
  
  RETURN json_build_object('success', true, 'payout_id', v_payout_id, 'amount', v_total);
END;
$$;

-- Get partner referrals (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_partner_referrals(p_partner_id UUID)
RETURNS TABLE (
  id UUID,
  referred_email TEXT,
  referred_user_id UUID,
  status TEXT,
  first_payment_at TIMESTAMPTZ,
  commission_amount NUMERIC,
  commission_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  RETURN QUERY SELECT 
    r.id, r.referred_email, r.referred_user_id, r.status,
    r.first_payment_at, r.commission_amount, r.commission_paid_at, r.created_at
  FROM public.referrals r
  WHERE r.partner_id = p_partner_id
  ORDER BY r.created_at DESC;
END;
$$;

-- Get partner payouts (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_partner_payouts(p_partner_id UUID)
RETURNS TABLE (
  id UUID,
  amount NUMERIC,
  pix_key TEXT,
  pix_key_type TEXT,
  referral_count INTEGER,
  paid_at TIMESTAMPTZ,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  RETURN QUERY SELECT 
    pp.id, pp.amount, pp.pix_key, pp.pix_key_type,
    array_length(pp.referral_ids, 1) as referral_count,
    pp.paid_at, pp.notes
  FROM public.partner_payouts pp
  WHERE pp.partner_id = p_partner_id
  ORDER BY pp.paid_at DESC;
END;
$$;

-- Validate referral code (public function)
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner RECORD;
BEGIN
  SELECT id, name INTO v_partner
  FROM public.partners
  WHERE referral_code = UPPER(p_code) AND status = 'active';
  
  IF v_partner IS NULL THEN
    RETURN json_build_object('valid', false);
  END IF;
  
  RETURN json_build_object('valid', true, 'partner_id', v_partner.id, 'partner_name', v_partner.name);
END;
$$;

-- Register referral (called during user signup)
CREATE OR REPLACE FUNCTION public.register_referral(p_user_id UUID, p_user_email TEXT, p_referral_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  -- Find active partner
  SELECT id INTO v_partner_id
  FROM public.partners
  WHERE referral_code = UPPER(p_referral_code) AND status = 'active';
  
  IF v_partner_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Código inválido');
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (partner_id, referred_user_id, referred_email)
  VALUES (v_partner_id, p_user_id, p_user_email)
  ON CONFLICT DO NOTHING;
  
  -- Update profile
  UPDATE public.profiles SET referred_by = v_partner_id WHERE id = p_user_id;
  
  -- Increment partner referral count
  UPDATE public.partners SET 
    total_referrals = total_referrals + 1,
    updated_at = NOW()
  WHERE id = v_partner_id;
  
  RETURN json_build_object('success', true, 'partner_id', v_partner_id);
END;
$$;

-- Process first payment referral commission (called from webhook)
CREATE OR REPLACE FUNCTION public.process_referral_commission(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_commission NUMERIC;
BEGIN
  -- Check if user was referred
  SELECT r.*, p.commission_value INTO v_referral
  FROM public.referrals r
  JOIN public.partners p ON p.id = r.partner_id
  WHERE r.referred_user_id = p_user_id AND r.status = 'registered';
  
  IF v_referral IS NULL THEN
    RETURN json_build_object('processed', false, 'reason', 'No pending referral');
  END IF;
  
  v_commission := v_referral.commission_value;
  
  -- Update referral
  UPDATE public.referrals SET
    status = 'commission_pending',
    first_payment_at = NOW(),
    commission_amount = v_commission
  WHERE id = v_referral.id;
  
  -- Update partner balance
  UPDATE public.partners SET
    pending_balance = pending_balance + v_commission,
    updated_at = NOW()
  WHERE id = v_referral.partner_id;
  
  RETURN json_build_object('processed', true, 'commission', v_commission, 'partner_id', v_referral.partner_id);
END;
$$;

-- Get partner dashboard data
CREATE OR REPLACE FUNCTION public.get_partner_dashboard(p_user_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner RECORD;
  v_referrals JSON;
  v_payouts JSON;
BEGIN
  -- Get partner
  SELECT * INTO v_partner
  FROM public.partners
  WHERE user_id = COALESCE(p_user_id, auth.uid());
  
  IF v_partner IS NULL THEN
    RETURN json_build_object('found', false);
  END IF;
  
  -- Get referrals
  SELECT COALESCE(json_agg(row_to_json(r.*) ORDER BY r.created_at DESC), '[]'::json) INTO v_referrals
  FROM (
    SELECT id, referred_email, status, first_payment_at, commission_amount, commission_paid_at, created_at
    FROM public.referrals WHERE partner_id = v_partner.id
  ) r;
  
  -- Get payouts
  SELECT COALESCE(json_agg(row_to_json(p.*) ORDER BY p.paid_at DESC), '[]'::json) INTO v_payouts
  FROM (
    SELECT id, amount, paid_at, notes FROM public.partner_payouts WHERE partner_id = v_partner.id
  ) p;
  
  RETURN json_build_object(
    'found', true,
    'partner', row_to_json(v_partner),
    'referrals', v_referrals,
    'payouts', v_payouts
  );
END;
$$;

-- Trigger to set updated_at
CREATE TRIGGER set_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_column();