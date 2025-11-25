import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Mariana Silva",
      role: "Designer de Sobrancelhas",
      city: "São Paulo - SP",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      text: "Antes do FichaZen eu perdia 2h por dia confirmando agendamentos. Agora faço tudo em 10 minutos com os templates!",
      result: "Economizei 12h/semana",
      rating: 5
    },
    {
      name: "Juliana Costa",
      role: "Especialista em Cílios",
      city: "Rio de Janeiro - RJ",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana",
      text: "Minhas clientes adoram receber a ficha pelo WhatsApp. Ficou tudo mais profissional e organizado.",
      result: "100% das fichas preenchidas",
      rating: 5
    },
    {
      name: "Patrícia Oliveira",
      role: "Esteticista Facial",
      city: "Belo Horizonte - MG",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
      text: "Os lembretes automáticos mudaram meu negócio. Reduzi faltas em 70% e consigo atender mais clientes!",
      result: "5 clientes a mais/semana",
      rating: 5
    },
    {
      name: "Fernanda Alves",
      role: "Manicure & Pedicure",
      city: "Curitiba - PR",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda",
      text: "Não consigo mais imaginar trabalhar sem o FichaZen. As fotos antes/depois ficam organizadas e posso mostrar para novas clientes facilmente.",
      result: "Portfolio organizado",
      rating: 5
    },
    {
      name: "Carla Mendes",
      role: "Micropigmentadora",
      city: "Brasília - DF",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
      text: "Os relatórios de faturamento me ajudaram a identificar meus procedimentos mais lucrativos. Agora tomo decisões baseadas em dados reais!",
      result: "+30% de faturamento",
      rating: 5
    },
    {
      name: "Amanda Santos",
      role: "Depiladora",
      city: "Porto Alegre - RS",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda",
      text: "Sistema muito fácil de usar! Em 5 minutos já estava enviando fichas para minhas clientes. Suporte excelente também!",
      result: "Configurei em 5 minutos",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Junte-se a <span className="text-secondary">+500 profissionais</span> que já dizem 'Zen'
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra como o FichaZen está transformando estúdios de beleza em todo o Brasil
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card p-6 rounded-xl shadow-card hover-lift animate-fade-in-up border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-muted-foreground mb-4 italic text-sm leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Result badge */}
              <div className="inline-block bg-secondary/10 px-3 py-1 rounded-full mb-4">
                <p className="text-xs font-semibold text-secondary">
                  ✨ {testimonial.result}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust metrics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary mb-2">⭐ 4.9/5</p>
            <p className="text-sm text-muted-foreground">Avaliação média</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary mb-2">+500</p>
            <p className="text-sm text-muted-foreground">Profissionais ativas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary mb-2">10h</p>
            <p className="text-sm text-muted-foreground">Economia média/semana</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary mb-2">95%</p>
            <p className="text-sm text-muted-foreground">Renovam assinatura</p>
          </div>
        </div>
      </div>
    </section>
  );
};
