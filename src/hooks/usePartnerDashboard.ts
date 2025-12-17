import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  pix_key: string;
  pix_key_type: string;
  referral_code: string;
  rejection_reason: string | null;
  status: string;
  commission_value: number;
  total_referrals: number;
  total_paid: number;
  pending_balance: number;
  created_at: string;
}

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  first_payment_at: string | null;
  commission_amount: number | null;
  commission_paid_at: string | null;
  created_at: string;
}

interface Payout {
  id: string;
  amount: number;
  paid_at: string;
  notes: string | null;
}

interface PartnerDashboardData {
  found: boolean;
  partner?: Partner;
  referrals?: Referral[];
  payouts?: Payout[];
}

export const usePartnerDashboard = () => {
  return useQuery({
    queryKey: ['partner-dashboard'],
    queryFn: async (): Promise<PartnerDashboardData> => {
      const { data, error } = await supabase.rpc('get_partner_dashboard');
      
      if (error) throw error;
      return data as unknown as PartnerDashboardData;
    },
  });
};

export const usePartnerStatus = () => {
  return useQuery({
    queryKey: ['partner-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { isPartner: false, status: null };

      const { data } = await supabase
        .from('partners')
        .select('id, status, referral_code')
        .eq('user_id', session.user.id)
        .maybeSingle();

      return {
        isPartner: !!data,
        status: data?.status || null,
        referralCode: data?.referral_code || null,
      };
    },
  });
};
