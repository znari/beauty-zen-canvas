import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Mariana Silva",
      role: "Designer de Sobrancelhas",
      studio: "Studio Bella",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      text: "Economizo pelo menos 2 horas por dia. Não consigo mais imaginar trabalhar sem o FichaZen!",
      rating: 5
    },
    {
      name: "Juliana Costa",
      role: "Especialista em Cílios",
      studio: "Lash by Ju",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana",
      text: "Minhas clientes adoram a praticidade. A ficha digital é profissional e organizada.",
      rating: 5
    },
    {
      name: "Patrícia Oliveira",
      role: "Esteticista",
      studio: "Estética Patty",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
      text: "Confirmações automáticas mudaram meu negócio. Reduzi faltas em 70%!",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Profissionais que já dizem <span className="text-secondary">'Zen'</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra como o FichaZen está transformando estúdios de beleza
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.studio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
