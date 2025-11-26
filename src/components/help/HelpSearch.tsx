import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HelpSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const HelpSearch = ({ value, onChange, placeholder = "Buscar artigos de ajuda..." }: HelpSearchProps) => {
  return (
    <div className="relative max-w-xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-12 h-12 text-base rounded-xl border-primary/20 focus:border-primary"
      />
    </div>
  );
};
