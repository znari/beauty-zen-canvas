import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useClientProfile = (clientId: string) => {
  return useQuery({
    queryKey: ["client-profile", clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar cliente com visitas e anamneses
      const { data: client, error } = await supabase
        .from("clients")
        .select(`
          *,
          visits (
            id,
            visit_date,
            visit_time,
            procedures,
            price_total,
            notes,
            status
          ),
          anamneses (
            id,
            filled_at,
            consent
          )
        `)
        .eq("id", clientId)
        .eq("professional_id", user.id)
        .single();

      if (error) throw error;
      if (!client) throw new Error("Cliente não encontrado");

      // Formatar dados
      const lastVisit = client.visits?.[0]?.visit_date 
        ? format(new Date(client.visits[0].visit_date), "dd/MM/yyyy")
        : "Sem visita";

      const anamnesisStatus = client.anamneses?.some(a => a.filled_at && a.consent)
        ? "Preenchida"
        : "Pendente";

      const anamnesisDate = client.anamneses?.find(a => a.filled_at)?.filled_at
        ? format(new Date(client.anamneses.find(a => a.filled_at)!.filled_at!), "dd/MM/yyyy")
        : null;

      const formattedVisits = (client.visits || [])
        .map(visit => ({
          id: visit.id,
          date: format(new Date(visit.visit_date), "dd/MM/yyyy"),
          time: visit.visit_time,
          procedures: Array.isArray(visit.procedures) 
            ? visit.procedures.map((p: any) => p.nome || p.name || 'Procedimento')
            : [],
          totalValue: Number(visit.price_total || 0),
          notes: visit.notes || "",
          status: visit.status === "scheduled" ? "Agendado" : "Realizado",
        }))
        .sort((a, b) => {
          // Ordenar por data decrescente (mais recente primeiro)
          const dateA = a.date.split('/').reverse().join('-');
          const dateB = b.date.split('/').reverse().join('-');
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

      return {
        id: client.id,
        name: client.name,
        phone: client.whatsapp_raw || "",
        registrationDate: format(new Date(client.created_at), "dd/MM/yyyy"),
        lastVisit,
        status: "Ativa",
        anamnesisStatus,
        anamnesisDate,
        visits: formattedVisits,
      };
    },
    enabled: !!clientId,
  });
};
