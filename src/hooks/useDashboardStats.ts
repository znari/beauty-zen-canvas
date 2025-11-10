import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar view já criada no banco
      const { data, error } = await supabase
        .from("v_dashboard_stats")
        .select("*")
        .eq("professional_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // Se não houver dados, retornar zeros
      if (!data) {
        return {
          totalClients: 0,
          pendingAnamneses: 0,
          visitsThisWeek: 0,
        };
      }

      return {
        totalClients: data.total_clients || 0,
        pendingAnamneses: data.pending_anamneses || 0,
        visitsThisWeek: data.visits_next_7_days || 0,
      };
    },
  });
};
