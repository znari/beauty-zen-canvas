import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const FAQSection = () => {
  const faqs = [
    {
      question: "Preciso cadastrar cartão de crédito?",
      answer: "Não! O teste grátis de 15 dias não requer cartão de crédito. Você só adiciona forma de pagamento se decidir continuar após o período de teste."
    },
    {
      question: "Como envio a ficha para o cliente?",
      answer: "Super simples! Com 1 clique, o FichaZen gera um link do WhatsApp com mensagem pronta e o link da ficha digital. Basta enviar!"
    },
    {
      question: "Posso personalizar as mensagens de confirmação?",
      answer: "Sim! Você pode personalizar completamente as mensagens que serão enviadas via WhatsApp para seus clientes."
    },
    {
      question: "Quantos clientes posso cadastrar?",
      answer: "Clientes ilimitados! No plano Zen PRO você não tem limite de clientes, fichas ou procedimentos."
    },
    {
      question: "Como funcionam as fotos Antes/Depois?",
      answer: "Você pode tirar ou fazer upload de fotos diretamente no perfil do cliente. Elas ficam organizadas por data e sempre acessíveis no histórico."
    },
    {
      question: "O FichaZen funciona no celular?",
      answer: "Sim! O FichaZen é 100% responsivo e funciona perfeitamente em celulares, tablets e computadores."
    }
  ];

  return (
    <section id="help" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre o FichaZen
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="text-left text-foreground hover:text-secondary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Ainda tem dúvidas? Entre em contato!
            </p>
            <Button variant="outline" size="lg" asChild>
              <a 
                href="https://wa.me/5511999999999?text=Olá! Tenho dúvidas sobre o FichaZen" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
