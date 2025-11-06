import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          visits (
            visit_date,
            status
          ),
          anamneses (
            filled_at
          )
        `)
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Formatar dados
      return data.map((client) => {
        const lastVisit = client.visits?.[0]?.visit_date;
        const hasFilledAnamnesis = client.anamneses?.some(a => a.filled_at);
        
        return {
          id: client.id,
          name: client.name,
          phone: client.whatsapp_raw || "",
          lastVisit: lastVisit ? format(new Date(lastVisit), "dd/MM/yyyy") : "Sem visita",
          anamnesisStatus: hasFilledAnamnesis ? "Preenchida" : "Pendente",
        };
      });
    },
  });
};
