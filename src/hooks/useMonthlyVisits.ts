import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export interface MonthlyVisit {
  id: string;
  visit_date: string;
  visit_time: string;
  status: string;
  client_name: string;
  procedures: any[];
  anamnesis_filled: boolean;
}

export const useMonthlyVisits = (selectedMonth: Date) => {
  return useQuery({
    queryKey: ["monthly-visits", format(selectedMonth, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

      const { data: visits, error } = await supabase
        .from("visits")
        .select(`
          id,
          visit_date,
          visit_time,
          status,
          procedures,
          clients (
            name,
            anamneses (
              filled_at,
              consent
            )
          )
        `)
        .eq("professional_id", user.id)
        .gte("visit_date", monthStart)
        .lte("visit_date", monthEnd)
        .order("visit_date", { ascending: true })
        .order("visit_time", { ascending: true });

      if (error) throw error;

      // Agrupar por data
      const groupedByDate: Record<string, MonthlyVisit[]> = {};
      
      visits?.forEach((visit: any) => {
        const dateKey = visit.visit_date;
        
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        
        groupedByDate[dateKey].push({
          id: visit.id,
          visit_date: visit.visit_date,
          visit_time: visit.visit_time,
          status: visit.status,
          client_name: visit.clients?.name || "Cliente",
          procedures: visit.procedures || [],
          anamnesis_filled: visit.clients?.anamneses?.some((a: any) => a.filled_at && a.consent) || false,
        });
      });

      return groupedByDate;
    },
  });
};
