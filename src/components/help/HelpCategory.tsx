import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HelpCategoryProps {
  icon: LucideIcon;
  title: string;
  description: string;
  articleCount: number;
  onClick: () => void;
}

export const HelpCategory = ({ icon: Icon, title, description, articleCount, onClick }: HelpCategoryProps) => {
  return (
    <Card 
      className="cursor-pointer hover-lift border-primary/10 hover:border-primary/30 transition-all group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
            <span className="text-xs text-primary/70 mt-2 inline-block">
              {articleCount} {articleCount === 1 ? "artigo" : "artigos"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
