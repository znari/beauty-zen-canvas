import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface BookingSettings {
  professional_id: string;
  studio_name: string;
  welcome_message: string | null;
  min_advance_hours: number;
  max_advance_days: number;
  slot_duration_minutes: number;
  working_hours: Record<string, WorkingHours>;
  blocked_dates: string[];
  require_approval: boolean;
}

export const usePublicBookingSettings = (slug: string) => {
  return useQuery({
    queryKey: ["public-booking-settings", slug],
    queryFn: async (): Promise<BookingSettings | null> => {
      if (!slug) return null;

      const { data, error } = await supabase
        .rpc("get_booking_settings_by_slug", { p_slug: slug });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const settings = data[0];
      return {
        professional_id: settings.professional_id,
        studio_name: settings.studio_name,
        welcome_message: settings.welcome_message,
        min_advance_hours: settings.min_advance_hours,
        max_advance_days: settings.max_advance_days,
        slot_duration_minutes: settings.slot_duration_minutes,
        working_hours: settings.working_hours as unknown as Record<string, WorkingHours>,
        blocked_dates: (settings.blocked_dates as unknown as string[]) || [],
        require_approval: settings.require_approval ?? true,
      };
    },
    enabled: !!slug,
  });
};
