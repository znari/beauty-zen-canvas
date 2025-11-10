import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatLocalDate } from "@/lib/dateUtils";

export const useClientAnamnesis = (clientId: string) => {
  return useQuery({
    queryKey: ["client-anamnesis", clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar cliente com última visita e anamnese
      const { data: client, error } = await supabase
        .from("clients")
        .select(`
          id,
          name,
          date_of_birth,
          visits (
            visit_date,
            visit_time
          ),
          anamneses (
            id,
            responses,
            data_nascimento,
            consent,
            filled_at
          )
        `)
        .eq("id", clientId)
        .eq("professional_id", user.id)
        .single();

      if (error) throw error;

      // Pegar última visita (mais recente)
      const sortedVisits = client.visits?.sort((a, b) => 
        new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
      );
      const lastVisit = sortedVisits?.[0];

      // Pegar anamnese mais recente
      const sortedAnamneses = client.anamneses?.sort((a, b) => 
        new Date(b.filled_at || 0).getTime() - new Date(a.filled_at || 0).getTime()
      );
      const anamnesis = sortedAnamneses?.[0];
      
      // Retornar dados formatados
      return {
        id: client.id,
        name: client.name,
        dateOfBirth: client.date_of_birth,
        lastProcedureDate: lastVisit ? formatLocalDate(lastVisit.visit_date, "dd/MM/yyyy") : null,
        lastProcedureTime: lastVisit ? lastVisit.visit_time.slice(0, 5) : null,
        anamnesis: anamnesis || null
      };
    },
    enabled: !!clientId
  });
};
