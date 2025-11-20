import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  professional_id: string;
  client_id: string | null;
  anamnesis_id: string | null;
  visit_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string | null;
}

interface UseNotificationsPaginatedParams {
  page: number;
  pageSize: number;
  filter?: 'all' | 'read' | 'unread';
  type?: string;
}

interface NotificationsPaginatedResult {
  notifications: Notification[];
  totalCount: number;
  totalPages: number;
}

export const useNotificationsPaginated = ({
  page,
  pageSize,
  filter = 'all',
  type = 'all'
}: UseNotificationsPaginatedParams) => {
  return useQuery({
    queryKey: ["notifications-paginated", page, pageSize, filter, type],
    queryFn: async (): Promise<NotificationsPaginatedResult> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Construir query base
      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("professional_id", user.id);

      // Aplicar filtro de leitura
      if (filter === 'read') {
        query = query.eq('read', true);
      } else if (filter === 'unread') {
        query = query.eq('read', false);
      }

      // Aplicar filtro de tipo
      if (type !== 'all') {
        query = query.eq('type', type);
      }

      // Aplicar paginação e ordenação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        notifications: data as Notification[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
};
