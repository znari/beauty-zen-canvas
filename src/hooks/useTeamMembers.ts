import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_owner: boolean;
  created_at: string;
}

export const useTeamMembers = (activeOnly: boolean = false) => {
  return useQuery({
    queryKey: ["team-members", activeOnly],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      let query = supabase
        .from("team_members")
        .select("*")
        .eq("owner_id", user.id)
        .order("is_owner", { ascending: false })
        .order("name", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TeamMember[];
    },
  });
};
