import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MessageType } from "@/lib/whatsapp";

export interface MessageTemplate {
  id: string;
  professional_id: string;
  nome: string;
  tipo: MessageType;
  conteudo: string;
  is_padrao: boolean;
  created_at: string;
  updated_at: string;
}

// Hook para buscar todos os templates
export const useMessageTemplates = () => {
  return useQuery({
    queryKey: ["message-templates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MessageTemplate[];
    },
  });
};

// Hook para criar template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<MessageTemplate, "id" | "professional_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("message_templates")
        .insert({
          ...template,
          professional_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar template: ${error.message}`);
    },
  });
};

// Hook para atualizar template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MessageTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("message_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
};

// Hook para deletar template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });
};

// Hook para definir template como padrão (apenas 1 por tipo)
export const useSetDefaultTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, tipo }: { id: string; tipo: MessageType }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Primeiro, remover padrão de todos do mesmo tipo
      await supabase
        .from("message_templates")
        .update({ is_padrao: false })
        .eq("professional_id", user.id)
        .eq("tipo", tipo);

      // Depois, definir este como padrão
      const { data, error } = await supabase
        .from("message_templates")
        .update({ is_padrao: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template definido como padrão!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao definir padrão: ${error.message}`);
    },
  });
};

// Hook para duplicar template
export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: MessageTemplate) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("message_templates")
        .insert({
          professional_id: user.id,
          nome: `${template.nome} (Cópia)`,
          tipo: template.tipo,
          conteudo: template.conteudo,
          is_padrao: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template duplicado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao duplicar: ${error.message}`);
    },
  });
};
