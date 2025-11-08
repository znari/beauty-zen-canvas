import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      visitId: string;
      visit_date: string;
      visit_time: string;
    }) => {
      const { error } = await supabase
        .from("visits")
        .update({
          visit_date: data.visit_date,
          visit_time: data.visit_time,
        })
        .eq("id", data.visitId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalida cache para forçar re-fetch
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
