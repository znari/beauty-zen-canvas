import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface BookingSettings {
  id: string;
  professional_id: string;
  is_enabled: boolean;
  booking_slug: string | null;
  welcome_message: string | null;
  min_advance_hours: number;
  max_advance_days: number;
  slot_duration_minutes: number;
  require_approval: boolean;
  working_hours: Record<string, WorkingHours>;
  blocked_dates: string[];
}

const defaultWorkingHours: Record<string, WorkingHours> = {
  monday: { enabled: true, start: "09:00", end: "18:00" },
  tuesday: { enabled: true, start: "09:00", end: "18:00" },
  wednesday: { enabled: true, start: "09:00", end: "18:00" },
  thursday: { enabled: true, start: "09:00", end: "18:00" },
  friday: { enabled: true, start: "09:00", end: "18:00" },
  saturday: { enabled: false, start: "09:00", end: "13:00" },
  sunday: { enabled: false, start: "09:00", end: "13:00" },
};

export const useBookingSettings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["booking-settings", user?.id],
    queryFn: async (): Promise<BookingSettings | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("booking_settings")
        .select("*")
        .eq("professional_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      return {
        id: data.id,
        professional_id: data.professional_id,
        is_enabled: data.is_enabled ?? true,
        booking_slug: data.booking_slug,
        welcome_message: data.welcome_message,
        min_advance_hours: data.min_advance_hours ?? 24,
        max_advance_days: data.max_advance_days ?? 30,
        slot_duration_minutes: data.slot_duration_minutes ?? 60,
        require_approval: data.require_approval ?? true,
        working_hours: (data.working_hours as unknown as Record<string, WorkingHours>) || defaultWorkingHours,
        blocked_dates: (data.blocked_dates as unknown as string[]) || [],
      };
    },
    enabled: !!user?.id,
  });
};

export { defaultWorkingHours };
