import { FileX, Clock, ImageOff, Search } from "lucide-react";
import problemIllustration from "@/assets/problem-illustration.jpg";

export const ProblemSection = () => {
  const problems = [
    {
      icon: FileX,
      title: "Fichas de papel perdidas ou amassadas",
      description: "Perde tempo procurando informações importantes dos clientes"
    },
    {
      icon: Clock,
      title: "Tempo perdido com confirmações",
      description: "Confirma agendamentos manualmente um por um no WhatsApp"
    },
    {
      icon: ImageOff,
      title: "Fotos desorganizadas",
      description: "Antes/depois espalhadas no rolo da câmera do celular"
    },
    {
      icon: Search,
      title: "Sem histórico acessível",
      description: "Dificuldade em acessar rapidamente o histórico do cliente"
    }
  ];

  return (
    <section id="problem" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Seu dia a dia parece com isso?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sabemos que gerenciar um estúdio de beleza vai muito além do atendimento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="bg-card p-6 rounded-xl shadow-card hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Illustration */}
        <div className="mt-16 flex justify-center">
          <img 
            src={problemIllustration} 
            alt="Profissional de beleza sobrecarregada com papelada" 
            className="w-64 h-64 object-contain opacity-80"
          />
        </div>
      </div>
    </section>
  );
};
