import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BookingRequest {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  procedure_id: string;
  procedure_name: string;
  assigned_professional_id: string | null;
  assigned_professional_name: string | null;
  requested_date: string;
  requested_time: string;
  notes: string | null;
  status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  converted_client_id: string | null;
  converted_visit_id: string | null;
  created_at: string;
}

export function useBookingRequests(statusFilter?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["booking-requests", user?.id, statusFilter],
    queryFn: async (): Promise<BookingRequest[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from("booking_requests")
        .select(`
          id,
          client_name,
          client_phone,
          client_email,
          procedure_id,
          assigned_professional_id,
          requested_date,
          requested_time,
          notes,
          status,
          rejection_reason,
          reviewed_at,
          converted_client_id,
          converted_visit_id,
          created_at,
          procedures (name),
          team_members (name)
        `)
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        client_name: item.client_name,
        client_phone: item.client_phone,
        client_email: item.client_email,
        procedure_id: item.procedure_id,
        procedure_name: item.procedures?.name || "Procedimento não encontrado",
        assigned_professional_id: item.assigned_professional_id,
        assigned_professional_name: item.team_members?.name || null,
        requested_date: item.requested_date,
        requested_time: item.requested_time,
        notes: item.notes,
        status: item.status,
        rejection_reason: item.rejection_reason,
        reviewed_at: item.reviewed_at,
        converted_client_id: item.converted_client_id,
        converted_visit_id: item.converted_visit_id,
        created_at: item.created_at,
      }));
    },
    enabled: !!user?.id,
  });
}
