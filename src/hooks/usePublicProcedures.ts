import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicProcedure {
  id: string;
  name: string;
  price: number;
  duration_minutes: number | null;
}

export const usePublicProcedures = (professionalId: string | undefined) => {
  return useQuery({
    queryKey: ["public-procedures", professionalId],
    queryFn: async (): Promise<PublicProcedure[]> => {
      if (!professionalId) return [];

      const { data, error } = await supabase
        .rpc("get_public_procedures", { p_professional_id: professionalId });

      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalId,
  });
};
