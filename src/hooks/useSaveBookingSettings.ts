import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WorkingHours } from "./useBookingSettings";
import { generateSlugFromName } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

interface SaveBookingSettingsData {
  is_enabled: boolean;
  welcome_message: string | null;
  min_advance_hours: number;
  max_advance_days: number;
  slot_duration_minutes: number;
  require_approval: boolean;
  working_hours: Record<string, WorkingHours>;
  blocked_dates: string[];
}

export const useSaveBookingSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveBookingSettingsData) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Buscar studio_name do perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("studio_name, full_name")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Gerar slug a partir do studio_name ou full_name
      const studioName = profile.studio_name || profile.full_name;
      let baseSlug = generateSlugFromName(studioName);
      if (!baseSlug || baseSlug.length < 3) {
        baseSlug = "meu-studio";
      }

      // Verificar duplicatas e adicionar sufixo se necessário
      let finalSlug = baseSlug;
      let counter = 1;
      
      while (true) {
        const { data: existingSlug } = await supabase
          .from("booking_settings")
          .select("professional_id")
          .eq("booking_slug", finalSlug)
          .neq("professional_id", user.id)
          .maybeSingle();

        if (!existingSlug) break;
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      const { data: result, error } = await supabase
        .from("booking_settings")
        .upsert({
          professional_id: user.id,
          is_enabled: data.is_enabled,
          booking_slug: finalSlug,
          welcome_message: data.welcome_message,
          min_advance_hours: data.min_advance_hours,
          max_advance_days: data.max_advance_days,
          slot_duration_minutes: data.slot_duration_minutes,
          require_approval: data.require_approval,
          working_hours: data.working_hours as unknown as Json,
          blocked_dates: data.blocked_dates as unknown as Json,
        }, { onConflict: "professional_id" })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-settings"] });
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de agendamento foram atualizadas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
