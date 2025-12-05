import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TerminateSessionsResponse {
  success: boolean;
  message: string;
  terminated_count: number;
  admin_email: string;
}

export function useTerminateSessions() {
  return useMutation({
    mutationFn: async (): Promise<TerminateSessionsResponse> => {
      const { data, error } = await supabase.functions.invoke<TerminateSessionsResponse>(
        "admin-terminate-sessions",
        { method: "POST" }
      );

      if (error) {
        throw new Error(error.message || "Erro ao encerrar sessões");
      }

      if (!data?.success) {
        throw new Error("Falha ao encerrar sessões");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.terminated_count} sessões encerradas com sucesso`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao encerrar sessões");
    },
  });
}
