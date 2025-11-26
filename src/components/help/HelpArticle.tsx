import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface Article {
  id: string;
  title: string;
  content: string;
}

interface HelpArticleProps {
  articles: Article[];
}

export const HelpArticle = ({ articles }: HelpArticleProps) => {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {articles.map((article) => (
        <AccordionItem 
          key={article.id} 
          value={article.id}
          className="border border-primary/10 rounded-xl px-4 bg-white"
        >
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-secondary hover:text-primary transition-colors">
              {article.title}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div 
              className="text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
