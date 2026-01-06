import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateBookingRequestData {
  professional_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  procedure_id: string;
  assigned_professional_id?: string;
  requested_date: string;
  requested_time: string;
  notes?: string;
}

export interface CreateBookingRequestResult {
  status: string;
  isAutoApproved: boolean;
}

export const useCreateBookingRequest = () => {
  return useMutation({
    mutationFn: async (data: CreateBookingRequestData): Promise<CreateBookingRequestResult> => {
      const { data: result, error } = await supabase
        .from("booking_requests")
        .insert({
          professional_id: data.professional_id,
          client_name: data.client_name,
          client_phone: data.client_phone,
          client_email: data.client_email || null,
          procedure_id: data.procedure_id,
          assigned_professional_id: data.assigned_professional_id || null,
          requested_date: data.requested_date,
          requested_time: data.requested_time,
          notes: data.notes || null,
        })
        .select("status")
        .single();

      if (error) throw error;

      return {
        status: result?.status || "pending",
        isAutoApproved: result?.status === "approved",
      };
    },
  });
};
