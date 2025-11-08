import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCancelVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitId: string) => {
      const { error } = await supabase
        .from("visits")
        .update({ status: "cancelled" })
        .eq("id", visitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};
