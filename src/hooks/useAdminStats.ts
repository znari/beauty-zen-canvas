import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  total_users: number;
  trial_users: number;
  active_subscribers: number;
  churned_users: number;
  mrr: number;
  total_revenue: number;
  paid_transactions: number;
  pending_transactions: number;
  new_users_this_month: number;
  new_users_last_month: number;
  total_clients: number;
  total_visits: number;
  filled_anamneses: number;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  studio_name: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string;
  subscription_ends_at: string;
  created_at: string;
}

interface AdminUserDetailed {
  id: string;
  email: string;
  full_name: string;
  studio_name: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string;
  subscription_ends_at: string;
  created_at: string;
  client_count: number;
  team_count: number;
  visit_count: number;
  completed_visit_count: number;
  total_revenue: number;
  anamnesis_count: number;
}

interface AdminTransaction {
  id: string;
  professional_id: string;
  plan_id: string;
  amount: number;
  status: string;
  payment_gateway: string;
  frequency: string;
  created_at: string;
  paid_at: string;
  user_email: string;
  user_name: string;
}

interface GrowthData {
  month: string;
  new_users: number;
  new_subscribers: number;
  revenue: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_stats");

      if (error) throw error;

      return (data as AdminStats[])?.[0] || null;
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_users");

      if (error) throw error;

      return (data as AdminUser[]) || [];
    },
  });
};

export const useAdminUsersDetailed = () => {
  return useQuery({
    queryKey: ["admin-users-detailed"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_users_detailed");

      if (error) throw error;

      return (data as AdminUserDetailed[]) || [];
    },
  });
};

export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_transactions");

      if (error) throw error;

      return (data as AdminTransaction[]) || [];
    },
  });
};

export const useAdminGrowth = () => {
  return useQuery({
    queryKey: ["admin-growth"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_growth");

      if (error) throw error;

      return (data as GrowthData[]) || [];
    },
  });
};
