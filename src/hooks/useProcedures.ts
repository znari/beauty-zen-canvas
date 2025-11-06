import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProcedures = () => {
  return useQuery({
    queryKey: ["procedures"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .eq("professional_id", user.id)
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      // Retornar no formato esperado pelo NewClient
      return data.map(proc => ({
        id: proc.id,
        nome: proc.name,
        preco: Number(proc.price) || 0,
      }));
    },
  });
};
