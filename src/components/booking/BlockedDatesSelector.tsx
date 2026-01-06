import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, CalendarX } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlockedDatesSelectorProps {
  blockedDates: string[];
  onChange: (dates: string[]) => void;
}

export const BlockedDatesSelector = ({
  blockedDates,
  onChange,
}: BlockedDatesSelectorProps) => {
  const today = startOfDay(new Date());

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateStr = format(date, "yyyy-MM-dd");
    
    if (blockedDates.includes(dateStr)) {
      onChange(blockedDates.filter((d) => d !== dateStr));
    } else {
      onChange([...blockedDates, dateStr].sort());
    }
  };

  const removeDate = (dateStr: string) => {
    onChange(blockedDates.filter((d) => d !== dateStr));
  };

  // Filter out past dates for display
  const futureDates = blockedDates.filter((dateStr) => {
    const date = parseISO(dateStr);
    return !isBefore(date, today);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={undefined}
          onSelect={handleSelect}
          disabled={(date) => isBefore(date, today)}
          modifiers={{
            blocked: blockedDates.map((d) => parseISO(d)),
          }}
          modifiersStyles={{
            blocked: {
              backgroundColor: "hsl(var(--destructive))",
              color: "hsl(var(--destructive-foreground))",
              borderRadius: "var(--radius)",
            },
          }}
          className="rounded-md border"
        />
      </div>
      
      {futureDates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <CalendarX className="h-4 w-4" />
            Datas bloqueadas ({futureDates.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {futureDates.map((dateStr) => (
              <Badge
                key={dateStr}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeDate(dateStr)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {futureDates.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Clique no calendário para bloquear datas específicas (feriados, férias, etc.)
        </p>
      )}
    </div>
  );
};
