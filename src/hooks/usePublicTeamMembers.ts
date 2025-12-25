import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicTeamMember {
  id: string;
  name: string;
  specialty: string | null;
}

export const usePublicTeamMembers = (professionalId: string | undefined) => {
  return useQuery({
    queryKey: ["public-team-members", professionalId],
    queryFn: async (): Promise<PublicTeamMember[]> => {
      if (!professionalId) return [];

      const { data, error } = await supabase
        .rpc("get_public_team_members", { p_professional_id: professionalId });

      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalId,
  });
};
