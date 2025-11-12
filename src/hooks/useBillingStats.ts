import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";

export interface BillingStats {
  totalRevenue: number;
  totalConfirmedRevenue: number;
  totalPendingRevenue: number;
  totalVisits: number;
  completedVisits: number;
  previousMonthRevenue: number;
  revenueGrowth: number;
  topProcedures: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  topClients: Array<{
    id: string;
    name: string;
    visits: number;
    totalSpent: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    visits: number;
  }>;
  procedureDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

export const useBillingStats = (selectedMonth: Date) => {
  return useQuery({
    queryKey: ["billing-stats", format(selectedMonth, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

      // Buscar visitas do mês atual
      const { data: visits, error } = await supabase
        .from("visits")
        .select(`
          id,
          visit_date,
          visit_time,
          status,
          price_total,
          procedures,
          client_id,
          clients (
            id,
            name
          )
        `)
        .eq("professional_id", user.id)
        .gte("visit_date", monthStart)
        .lte("visit_date", monthEnd)
        .order("visit_date", { ascending: true });

      if (error) throw error;

      // Buscar visitas do mês anterior para comparação
      const previousMonth = subMonths(selectedMonth, 1);
      const prevMonthStart = format(startOfMonth(previousMonth), "yyyy-MM-dd");
      const prevMonthEnd = format(endOfMonth(previousMonth), "yyyy-MM-dd");

      const { data: previousVisits, error: prevError } = await supabase
        .from("visits")
        .select("price_total, status")
        .eq("professional_id", user.id)
        .gte("visit_date", prevMonthStart)
        .lte("visit_date", prevMonthEnd)
        .eq("status", "completed");

      if (prevError) throw prevError;

      // Calcular totais
      const totalRevenue = visits
        ?.filter((v) => v.status === "completed")
        .reduce((sum, v) => sum + (Number(v.price_total) || 0), 0) || 0;

      const totalPendingRevenue = visits
        ?.filter((v) => v.status === "scheduled")
        .reduce((sum, v) => sum + (Number(v.price_total) || 0), 0) || 0;

      const completedVisits = visits?.filter((v) => v.status === "completed").length || 0;
      const totalVisits = visits?.length || 0;

      const previousMonthRevenue = previousVisits
        ?.reduce((sum, v) => sum + (Number(v.price_total) || 0), 0) || 0;

      const revenueGrowth = previousMonthRevenue > 0
        ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      // Processar top procedimentos
      const procedureMap: Record<string, { count: number; revenue: number }> = {};
      
      visits?.forEach((visit) => {
        if (visit.status !== "completed") return;
        
        const procedures = visit.procedures as any[];
        procedures?.forEach((proc: any) => {
          const name = proc.nome || proc.name || "Sem nome";
          if (!procedureMap[name]) {
            procedureMap[name] = { count: 0, revenue: 0 };
          }
          procedureMap[name].count++;
          procedureMap[name].revenue += Number(proc.preco || proc.price || 0);
        });
      });

      const topProcedures = Object.entries(procedureMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Processar top clientes
      const clientMap: Record<string, { name: string; visits: number; totalSpent: number }> = {};
      
      visits?.forEach((visit) => {
        if (visit.status !== "completed") return;
        
        const clientId = visit.client_id;
        const clientName = (visit.clients as any)?.name || "Cliente";
        
        if (!clientMap[clientId]) {
          clientMap[clientId] = { name: clientName, visits: 0, totalSpent: 0 };
        }
        clientMap[clientId].visits++;
        clientMap[clientId].totalSpent += Number(visit.price_total || 0);
      });

      const topClients = Object.entries(clientMap)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      // Processar faturamento diário
      const dailyMap: Record<string, { revenue: number; visits: number }> = {};
      
      visits?.forEach((visit) => {
        if (visit.status !== "completed") return;
        
        const date = format(new Date(visit.visit_date), "dd/MM");
        if (!dailyMap[date]) {
          dailyMap[date] = { revenue: 0, visits: 0 };
        }
        dailyMap[date].revenue += Number(visit.price_total || 0);
        dailyMap[date].visits++;
      });

      const dailyRevenue = Object.entries(dailyMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split("/");
          const [dayB, monthB] = b.date.split("/");
          return Number(dayA) - Number(dayB);
        });

      // Distribuição por procedimento
      const procedureDistribution = topProcedures.map((proc) => ({
        name: proc.name,
        value: proc.revenue,
        percentage: totalRevenue > 0 ? (proc.revenue / totalRevenue) * 100 : 0,
      }));

      return {
        totalRevenue,
        totalConfirmedRevenue: totalRevenue,
        totalPendingRevenue,
        totalVisits,
        completedVisits,
        previousMonthRevenue,
        revenueGrowth,
        topProcedures,
        topClients,
        dailyRevenue,
        procedureDistribution,
      } as BillingStats;
    },
  });
};
