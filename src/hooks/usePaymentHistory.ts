import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PaymentHistoryFilters {
  status?: string;
  planId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export const usePaymentHistory = (filters: PaymentHistoryFilters) => {
  return useQuery({
    queryKey: ["payment-history", filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      let query = supabase
        .from("billing_transactions")
        .select("*")
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.planId) {
        query = query.eq("plan_id", filters.planId);
      }

      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }

      if (filters.search) {
        query = query.or(`abacate_bill_id.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
      }

      const { data: transactions, error } = await query;
      if (error) throw error;

      const { data: plans } = await supabase
        .from("plan_definitions")
        .select("id, name");

      const planMap = new Map(plans?.map(p => [p.id, p.name]) || []);

      const summary = {
        totalPaid: transactions
          .filter(t => t.status === 'paid')
          .reduce((sum, t) => sum + t.amount, 0),
        totalPending: transactions
          .filter(t => t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0),
        totalCount: transactions.length
      };

      return {
        transactions: transactions.map(t => ({
          ...t,
          plan_name: planMap.get(t.plan_id) || t.plan_id
        })),
        summary
      };
    }
  });
};
