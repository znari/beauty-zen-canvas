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
      question: "Preciso de conhecimentos técnicos para usar?",
      answer: "Não! Se você sabe usar WhatsApp, você sabe usar FichaZen. Interface intuitiva criada especialmente para profissionais de beleza. Você configura tudo em 5 minutos e já está enviando fichas para seus clientes."
    },
    {
      question: "Meus dados e fotos estão seguros?",
      answer: "100% seguro! Usamos a mesma tecnologia de bancos (Supabase) com criptografia de ponta a ponta e RLS (Row Level Security). Suas fotos ficam em storage privado e só você tem acesso. Backup automático diário."
    },
    {
      question: "Como funciona o teste grátis de 15 dias?",
      answer: "Teste COMPLETO por 15 dias. Todas as funcionalidades liberadas. Sem cartão de crédito. Sem pegadinhas. Você cria sua conta, escolhe um plano para testar, e tem 15 dias para decidir se quer continuar."
    },
    {
      question: "E se eu quiser cancelar?",
      answer: "Sem multa. Sem fidelidade. Cancele com 1 clique a qualquer momento direto no painel. Seus dados ficam salvos por 30 dias caso você queira voltar. Simples assim!"
    },
    {
      question: "O FichaZen funciona no celular?",
      answer: "Sim! Design 100% responsivo otimizado para celular, tablet e computador. Você pode gerenciar seu estúdio de qualquer lugar, a qualquer hora."
    },
    {
      question: "Quantos clientes posso cadastrar?",
      answer: "No plano Essencial: até 10 clientes. No plano Pro e Ultimate: ILIMITADOS! Cadastre quantos clientes quiser sem custo adicional. Sem surpresas na fatura."
    },
    {
      question: "Como envio a ficha para o cliente preencher?",
      answer: "Super fácil! No perfil do cliente, clique em 'Enviar Ficha'. O FichaZen gera automaticamente uma mensagem pronta com o link único da ficha. Você pode abrir direto no WhatsApp ou copiar a mensagem. O cliente clica no link e preenche tudo online."
    },
    {
      question: "Posso personalizar as mensagens e a ficha?",
      answer: "Sim! Você tem 11 templates de mensagens prontas que pode editar como quiser. A ficha de anamnese também é 100% personalizável — adicione, remova ou edite perguntas conforme seu procedimento."
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
            Respondendo suas dúvidas antes mesmo de você perguntar
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="text-left text-foreground hover:text-secondary py-4">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8">
            <p className="text-lg font-semibold text-foreground mb-2">
              Ainda tem dúvidas?
            </p>
            <p className="text-muted-foreground mb-6">
              Nossa equipe está pronta para te ajudar via WhatsApp
            </p>
            <Button variant="hero" size="lg" asChild className="shadow-button">
              <a 
                href="https://wa.me/5511999999999?text=Olá! Tenho dúvidas sobre o FichaZen" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                💬 Falar no WhatsApp
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Resposta em até 2h • Segunda a sexta, 9h-18h
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
