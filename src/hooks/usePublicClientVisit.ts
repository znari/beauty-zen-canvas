import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatLocalDate } from "@/lib/dateUtils";

export const usePublicClientVisit = (clientId: string) => {
  return useQuery({
    queryKey: ["public-client-visit", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_public_visit_info' as any, { client_uuid: clientId });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Visita não encontrada");
      }

      const visit = data[0] as any;
      
      // Extrair nome do primeiro procedimento
      const procedures = visit.procedures as any[];
      const procedureName = procedures && procedures.length > 0 
        ? procedures[0]?.nome || procedures[0]?.name 
        : "Procedimento não especificado";
      
      // Verificar se a visita já passou
      const visitDateTime = visit.visit_date && visit.visit_time 
        ? new Date(`${visit.visit_date}T${visit.visit_time}`)
        : null;
      const now = new Date();
      const hasExpired = visitDateTime ? visitDateTime < now : false;
      
      return {
        clientId: visit.client_id,
        clientName: visit.client_name,
        visitDate: visit.visit_date,
        visitTime: visit.visit_time ? visit.visit_time.slice(0, 5) : null,
        procedureName,
        professionalName: visit.professional_name || "Profissional",
        studioName: visit.studio_name || null,
        anamnesisId: visit.anamnesis_id,
        anamnesisResponses: visit.anamnesis_responses,
        anamnesisFilledAt: visit.anamnesis_filled_at,
        anamnesisConsent: visit.anamnesis_consent,
        isAlreadyFilled: !!visit.anamnesis_filled_at && visit.anamnesis_consent,
        hasExpired
      };
    },
    enabled: !!clientId,
    retry: 1
  });
};
