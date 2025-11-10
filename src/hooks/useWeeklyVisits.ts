import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatLocalDate } from "@/lib/dateUtils";

export const useWeeklyVisits = () => {
  return useQuery({
    queryKey: ["weekly-visits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from("visits")
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq("professional_id", user.id)
        .gte("visit_date", format(weekStart, "yyyy-MM-dd"))
        .lte("visit_date", format(weekEnd, "yyyy-MM-dd"))
        .order("visit_date", { ascending: true })
        .order("visit_time", { ascending: true });

      if (error) throw error;

      // Agrupar por data
      const grouped: Record<string, any[]> = {};
      
      data.forEach((visit) => {
        const date = formatLocalDate(visit.visit_date, "dd/MM");
        if (!grouped[date]) grouped[date] = [];
        
        grouped[date].push({
          id: visit.id,
          time: visit.visit_time.slice(0, 5),
          client: visit.clients?.name || "Cliente desconhecido",
          procedure: visit.procedures?.[0]?.nome || "Sem procedimento",
          notes: visit.notes || "",
          status: visit.status,
          completedAt: visit.completed_at 
            ? format(new Date(visit.completed_at), "dd/MM/yyyy 'às' HH:mm")
            : null,
        });
      });

      return grouped;
    },
  });
};
