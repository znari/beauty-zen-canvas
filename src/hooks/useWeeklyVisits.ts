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
            name,
            id,
            whatsapp_normalized,
            anamneses (
              id,
              filled_at,
              consent
            )
          ),
          assigned_professional:team_members!visits_assigned_professional_id_fkey (
            id,
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
        
        // Verificar status da anamnese
        const hasFilledAnamnesis = visit.clients?.anamneses?.some(
          (a: any) => a.filled_at && a.consent
        );
        
        // Determinar status visual
        let visualStatus = "scheduled"; // padrão
        if (visit.status === "cancelled") {
          visualStatus = "cancelled";
        } else if (visit.status === "completed") {
          visualStatus = "completed";
        } else if (!hasFilledAnamnesis) {
          visualStatus = "pending"; // amarelo - ficha não preenchida
        } else {
          visualStatus = "confirmed"; // verde - tudo ok
        }
        
        grouped[date].push({
          id: visit.id,
          clientId: visit.clients?.id,
          clientPhone: visit.clients?.whatsapp_normalized || "",
          time: visit.visit_time.slice(0, 5),
          client: visit.clients?.name || "Cliente desconhecido",
          procedure: visit.procedures?.[0]?.nome || "Sem procedimento",
          notes: visit.notes || "",
          status: visit.status,
          visualStatus: visualStatus,
          hasFilledAnamnesis: hasFilledAnamnesis,
          completedAt: visit.completed_at 
            ? format(new Date(visit.completed_at), "dd/MM/yyyy 'às' HH:mm")
            : null,
          professionalId: visit.assigned_professional_id,
          professionalName: (visit.assigned_professional as any)?.name || "Não atribuído",
        });
      });

      return grouped;
    },
  });
};
