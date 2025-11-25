import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCanCreateResource } from "./useCanCreateResource";
import { toast } from "sonner";

export interface CreateClientData {
  nome?: string;
  whatsapp?: string;
  dataNascimento?: string;
  dataVisita?: string;
  horaVisita?: string;
  notasGerais?: string;
  assignedProfessionalId?: string;
  procedimentos?: Array<{
    procedimentoId?: string;
    nome?: string;
    preco?: number;
    observacoes?: string;
  }>;
}

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { canCreate } = useCanCreateResource();
  
  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      // Verificar limites ANTES de criar
      if (!canCreate('client')) {
        throw new Error("Limite de clientes atingido");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Validação
      if (!data.nome || !data.whatsapp || !data.dataVisita || !data.horaVisita || !data.procedimentos?.length) {
        throw new Error("Dados obrigatórios faltando");
      }

      // ✨ Verificar se é o primeiro cliente
      const { data: statsData } = await supabase
        .from("v_dashboard_stats")
        .select("total_clients")
        .eq("professional_id", user.id)
        .maybeSingle();
      
      const isFirstClient = !statsData || statsData.total_clients === 0;

      // 1. Criar cliente
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: data.nome,
          whatsapp_raw: data.whatsapp,
          date_of_birth: data.dataNascimento || null,
          professional_id: user.id,
          notes: data.notasGerais || null,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Calcular preço total
      const priceTotal = data.procedimentos.reduce((sum, proc) => sum + (proc.preco || 0), 0);

      // 3. Criar visita
      const { data: visit, error: visitError } = await supabase
        .from("visits")
        .insert({
          client_id: client.id,
          professional_id: user.id,
          visit_date: data.dataVisita,
          visit_time: data.horaVisita,
          status: "scheduled",
          procedures: data.procedimentos,
          price_total: priceTotal,
          notes: data.notasGerais || null,
          assigned_professional_id: data.assignedProfessionalId || null,
        })
        .select()
        .single();

      if (visitError) throw visitError;

      return { client, visit, isFirstClient };
    },
    onSuccess: () => {
      // Invalida cache para forçar re-fetch
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      toast.success("Cliente cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      if (error.message !== "Limite de clientes atingido") {
        toast.error("Erro ao cadastrar cliente", {
          description: error.message,
        });
      }
    },
  });
};
