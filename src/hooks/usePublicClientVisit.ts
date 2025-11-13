import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatLocalDate } from "@/lib/dateUtils";

export const usePublicClientVisit = (clientId: string) => {
  return useQuery({
    queryKey: ["public-client-visit", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_public_visit_info', { client_uuid: clientId });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Visita não encontrada");
      }

      const visit = data[0];
      
      // Extrair nome do primeiro procedimento com type assertion
      const procedures = visit.procedures as any[];
      const procedureName = procedures && procedures.length > 0 
        ? procedures[0]?.nome || procedures[0]?.name 
        : "Procedimento não especificado";
      
      return {
        clientId: visit.client_id,
        clientName: visit.client_name,
        visitDate: visit.visit_date,
        visitTime: visit.visit_time ? visit.visit_time.slice(0, 5) : null,
        procedureName,
        professionalName: visit.professional_name || "Profissional",
        anamnesisId: visit.anamnesis_id,
        anamnesisResponses: visit.anamnesis_responses,
        anamnesisFilledAt: visit.anamnesis_filled_at,
        anamnesisConsent: visit.anamnesis_consent,
        isAlreadyFilled: !!visit.anamnesis_filled_at && visit.anamnesis_consent
      };
    },
    enabled: !!clientId,
    retry: 1
  });
};
