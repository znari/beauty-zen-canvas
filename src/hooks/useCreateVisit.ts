import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCanCreateResource } from "./useCanCreateResource";
import { toast } from "sonner";

interface CreateVisitData {
  clientId: string;
  visit_date: string;
  visit_time: string;
  procedures: Array<{
    id: string;
    nome: string;
    preco: number;
    observacoes?: string;
  }>;
  notes?: string;
}

export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  const { canCreate } = useCanCreateResource();

  return useMutation({
    mutationFn: async (data: CreateVisitData) => {
      // Verificar limites ANTES de criar
      if (!canCreate('anamnesis')) {
        throw new Error("Limite de fichas atingido");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Calcular preço total
      const priceTotal = data.procedures.reduce(
        (sum, proc) => sum + Number(proc.preco),
        0
      );

      // Criar visita
      const { data: visit, error } = await supabase
        .from("visits")
        .insert({
          client_id: data.clientId,
          professional_id: user.id,
          visit_date: data.visit_date,
          visit_time: data.visit_time,
          procedures: data.procedures,
          price_total: priceTotal,
          notes: data.notes || "",
          status: "scheduled",
        })
        .select()
        .single();

      if (error) throw error;
      return visit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    },
    onError: (error: Error) => {
      if (error.message !== "Limite de fichas atingido") {
        toast.error("Erro ao criar visita", {
          description: error.message,
        });
      }
    },
  });
};
