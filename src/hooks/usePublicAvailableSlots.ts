import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, parse, isAfter, addHours } from "date-fns";
import type { WorkingHours } from "./usePublicBookingSettings";

interface BookedSlot {
  start_time: string;
  end_time: string;
}

const DAY_MAP: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export const usePublicAvailableSlots = (
  professionalId: string | undefined,
  date: Date | undefined,
  teamMemberId: string | undefined,
  workingHours: Record<string, WorkingHours> | undefined,
  slotDurationMinutes: number = 60,
  minAdvanceHours: number = 24
) => {
  return useQuery({
    queryKey: [
      "public-available-slots",
      professionalId,
      date ? format(date, "yyyy-MM-dd") : null,
      teamMemberId,
    ],
    queryFn: async (): Promise<string[]> => {
      if (!professionalId || !date || !workingHours) return [];

      const dayOfWeek = date.getDay();
      const dayKey = DAY_MAP[dayOfWeek];
      const dayHours = workingHours[dayKey];

      if (!dayHours || !dayHours.enabled) return [];

      // Fetch booked slots
      const { data: bookedSlots, error } = await supabase
        .rpc("get_booked_slots", {
          p_professional_id: professionalId,
          p_date: format(date, "yyyy-MM-dd"),
          p_team_member_id: teamMemberId || null,
        });

      if (error) throw error;

      // Generate all possible slots
      const slots: string[] = [];
      const startTime = parse(dayHours.start, "HH:mm", date);
      const endTime = parse(dayHours.end, "HH:mm", date);
      const minAdvanceTime = addHours(new Date(), minAdvanceHours);

      let currentSlot = startTime;

      while (currentSlot < endTime) {
        const slotTimeStr = format(currentSlot, "HH:mm");
        const slotDateTime = parse(slotTimeStr, "HH:mm", date);

        // Check if slot is far enough in the future
        const isAfterMinAdvance = isAfter(slotDateTime, minAdvanceTime);

        // Check if slot conflicts with booked slots
        const isBooked = (bookedSlots as BookedSlot[])?.some((booked) => {
          const bookedStart = booked.start_time.substring(0, 5);
          const bookedEnd = booked.end_time.substring(0, 5);
          return slotTimeStr >= bookedStart && slotTimeStr < bookedEnd;
        });

        if (isAfterMinAdvance && !isBooked) {
          slots.push(slotTimeStr);
        }

        currentSlot = addMinutes(currentSlot, slotDurationMinutes);
      }

      return slots;
    },
    enabled: !!professionalId && !!date && !!workingHours,
  });
};
