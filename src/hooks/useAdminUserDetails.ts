import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  studio_name: string;
  phone_raw: string;
  cpf_cnpj: string;
  avatar_url: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string;
  subscription_started_at: string;
  subscription_ends_at: string;
  last_payment_date: string;
  created_at: string;
  address_city: string;
  address_state: string;
}

export interface UserClient {
  id: string;
  name: string;
  whatsapp_raw: string;
  created_at: string;
}

export interface UserTeamMember {
  id: string;
  name: string;
  email: string;
  specialty: string;
  is_owner: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserTransaction {
  id: string;
  plan_id: string;
  amount: number;
  status: string;
  payment_gateway: string;
  frequency: string;
  created_at: string;
  paid_at: string;
}

export interface AdminUserDetails {
  profile: UserProfile;
  clients: UserClient[];
  team: UserTeamMember[];
  transactions: UserTransaction[];
}

export function useAdminUserDetails(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-details', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase.rpc('get_admin_user_details', {
        p_user_id: userId
      });

      if (error) throw error;
      return data as unknown as AdminUserDetails;
    },
    enabled: !!userId
  });
}
