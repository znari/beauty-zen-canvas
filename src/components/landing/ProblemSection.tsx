import { FileX, Clock, ImageOff, Search } from "lucide-react";
import problemIllustration from "@/assets/problem-illustration.jpg";

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
      impact: "R$ 800/mês"
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
    <section id="problem" className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Você está perdendo <span className="text-secondary">R$ 1.500/mês</span> sem perceber
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tempo perdido em tarefas administrativas = dinheiro deixando de entrar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon;
            return (
              <div 
                key={index}
                className="bg-card p-6 rounded-xl shadow-card hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {problem.description}
                </p>
                <p className="text-xs font-semibold text-secondary">
                  {problem.impact}
                </p>
              </div>
            );
          })}
        </div>

        {/* Illustration */}
        <div className="mt-12 sm:mt-16 flex justify-center">
          <img 
            src={problemIllustration} 
            alt="Profissional de beleza sobrecarregada com papelada" 
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 object-contain opacity-80"
          />
        </div>
      </div>
    </section>
  );
};
