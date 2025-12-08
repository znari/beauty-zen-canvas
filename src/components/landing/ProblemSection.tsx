import { FileX, Clock, ImageOff, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ProblemSection = () => {
  const problems = [
    {
      icon: FileX,
      title: "📋 40% das fichas perdidas",
      description: "= Retrabalho e risco legal de não ter histórico do cliente",
      impact: "2h/dia perdidas"
    },
    {
      icon: Clock,
      title: "⏰ 8h/semana em confirmações",
      description: "= R$ 800 de perda produtiva por mês confirmando manualmente",
      impact: "R$ 800/mês",
      highlight: true
    },
    {
      icon: ImageOff,
      title: "📸 Fotos no rolo da câmera",
      description: "= Perda de oportunidades de marketing e portfólio desorganizado",
      impact: "0 marketing"
    },
    {
      icon: Search,
      title: "💰 Sem controle financeiro",
      description: "= Impossível planejar crescimento ou identificar melhores procedimentos",
      impact: "Estagnação"
    }
  ];

  return (
    <section id="problem" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-destructive font-semibold mb-2 text-sm uppercase tracking-wide">⚠️ Atenção</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Você está perdendo <span className="text-secondary font-extrabold">R$ 1.500/mês</span> sem perceber
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tempo perdido em tarefas administrativas = dinheiro deixando de entrar
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon;
            return (
              <div 
                key={index}
                className={`relative bg-card p-6 rounded-xl shadow-lg border-l-4 
                  ${problem.highlight 
                    ? 'border-destructive hover:border-destructive' 
                    : 'border-destructive/50 hover:border-destructive/80'
                  } 
                  transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
                  opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {problem.highlight && (
                  <span className="absolute -top-3 right-4 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full animate-badge-pop">
                    MAIOR PERDA
                  </span>
                )}
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {problem.description}
                </p>
                <p className="text-xs font-bold text-destructive">
                  {problem.impact}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA de Urgência */}
        <div className="mt-12 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <p className="text-lg text-muted-foreground mb-4">
            💡 A boa notícia: <strong className="text-foreground">você pode resolver isso em 2 minutos</strong>
          </p>
          <Button asChild size="lg" className="group">
            <Link to="/registro">
              Quero parar de perder dinheiro
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
