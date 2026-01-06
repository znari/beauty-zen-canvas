import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface WorkingHoursRowProps {
  day: string;
  label: string;
  value: WorkingHours;
  onChange: (value: WorkingHours) => void;
}

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

export const WorkingHoursRow = ({
  day,
  label,
  value,
  onChange,
}: WorkingHoursRowProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b last:border-0">
      <div className="flex items-center gap-3 min-w-[140px]">
        <Switch
          id={`${day}-enabled`}
          checked={value.enabled}
          onCheckedChange={(checked) => onChange({ ...value, enabled: checked })}
        />
        <Label htmlFor={`${day}-enabled`} className="font-medium capitalize">
          {label}
        </Label>
      </div>
      
      {value.enabled && (
        <div className="flex items-center gap-2 ml-0 sm:ml-auto">
          <Select
            value={value.start}
            onValueChange={(start) => onChange({ ...value, start })}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={`start-${time}`} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-muted-foreground">até</span>
          
          <Select
            value={value.end}
            onValueChange={(end) => onChange({ ...value, end })}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={`end-${time}`} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {!value.enabled && (
        <span className="text-muted-foreground text-sm ml-0 sm:ml-auto">
          Fechado
        </span>
      )}
    </div>
  );
};
