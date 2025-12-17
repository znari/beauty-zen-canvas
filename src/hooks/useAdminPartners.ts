import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Partner {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  referral_code: string;
  status: string;
  rejection_reason: string | null;
  commission_value: number;
  total_referrals: number;
  total_paid: number;
  pending_balance: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PendingCommission {
  referral_id: string;
  partner_id: string;
  partner_name: string;
  partner_email: string;
  partner_pix_key: string;
  partner_pix_key_type: string;
  referred_email: string;
  commission_amount: number;
  first_payment_at: string;
}

export const useAdminPartners = () => {
  return useQuery({
    queryKey: ['admin-partners'],
    queryFn: async (): Promise<Partner[]> => {
      const { data, error } = await supabase.rpc('admin_get_partners');
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAdminPendingCommissions = () => {
  return useQuery({
    queryKey: ['admin-pending-commissions'],
    queryFn: async (): Promise<PendingCommission[]> => {
      const { data, error } = await supabase.rpc('admin_get_pending_commissions');
      if (error) throw error;
      return data || [];
    },
  });
};

export const useApprovePartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ partnerId, commissionValue }: { partnerId: string; commissionValue?: number }) => {
      const { data, error } = await supabase.rpc('admin_approve_partner', {
        p_partner_id: partnerId,
        p_commission_value: commissionValue,
      });
      if (error) throw error;
      return data as unknown as { success: boolean; referral_code: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      toast.success(`Parceiro aprovado! Código: ${data.referral_code}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao aprovar parceiro');
    },
  });
};

export const useRejectPartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ partnerId, reason }: { partnerId: string; reason: string }) => {
      const { data, error } = await supabase.rpc('admin_reject_partner', {
        p_partner_id: partnerId,
        p_reason: reason,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      toast.success('Parceiro rejeitado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao rejeitar parceiro');
    },
  });
};

export const useSuspendPartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ partnerId, reason }: { partnerId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc('admin_suspend_partner', {
        p_partner_id: partnerId,
        p_reason: reason,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      toast.success('Parceiro suspenso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao suspender parceiro');
    },
  });
};

export const usePayCommissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ referralIds, notes }: { referralIds: string[]; notes?: string }) => {
      const { data, error } = await supabase.rpc('admin_pay_commissions', {
        p_referral_ids: referralIds,
        p_notes: notes,
      });
      if (error) throw error;
      return data as unknown as { success: boolean; payout_id: string; amount: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-commissions'] });
      toast.success(`Comissão de R$ ${data.amount.toFixed(2)} marcada como paga!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao pagar comissão');
    },
  });
};
