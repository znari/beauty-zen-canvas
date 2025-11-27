import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import marianaAvatar from "@/assets/testimonials/mariana-silva.webp";
import julianaAvatar from "@/assets/testimonials/juliana-costa.webp";
import patriciaAvatar from "@/assets/testimonials/patricia-oliveira.webp";
import fernandaAvatar from "@/assets/testimonials/fernanda-alves.webp";
import carlaAvatar from "@/assets/testimonials/carla-mendes.webp";
import amandaAvatar from "@/assets/testimonials/amanda-santos.webp";

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const testimonials = [
    {
      name: "Mariana Silva",
      role: "Designer de Sobrancelhas",
      city: "São Paulo - SP",
      avatar: marianaAvatar,
      text: "Antes do FichaZen eu perdia 2h por dia confirmando agendamentos. Agora faço tudo em 10 minutos com os templates!",
      result: "Economizei 12h/semana",
      rating: 5
    },
    {
      name: "Juliana Costa",
      role: "Especialista em Cílios",
      city: "Rio de Janeiro - RJ",
      avatar: julianaAvatar,
      text: "Minhas clientes adoram receber a ficha pelo WhatsApp. Ficou tudo mais profissional e organizado.",
      result: "100% das fichas preenchidas",
      rating: 5
    },
    {
      name: "Patrícia Oliveira",
      role: "Esteticista Facial",
      city: "Belo Horizonte - MG",
      avatar: patriciaAvatar,
      text: "Os lembretes automáticos mudaram meu negócio. Reduzi faltas em 70% e consigo atender mais clientes!",
      result: "5 clientes a mais/semana",
      rating: 5
    },
    {
      name: "Fernanda Alves",
      role: "Manicure & Pedicure",
      city: "Curitiba - PR",
      avatar: fernandaAvatar,
      text: "Não consigo mais imaginar trabalhar sem o FichaZen. As fotos antes/depois ficam organizadas e posso mostrar para novas clientes facilmente.",
      result: "Portfolio organizado",
      rating: 5
    },
    {
      name: "Carla Mendes",
      role: "Micropigmentadora",
      city: "Brasília - DF",
      avatar: carlaAvatar,
      text: "Os relatórios de faturamento me ajudaram a identificar meus procedimentos mais lucrativos. Agora tomo decisões baseadas em dados reais!",
      result: "+30% de faturamento",
      rating: 5
    },
    {
      name: "Amanda Santos",
      role: "Depiladora",
      city: "Porto Alegre - RS",
      avatar: amandaAvatar,
      text: "Sistema muito fácil de usar! Em 5 minutos já estava enviando fichas para minhas clientes. Suporte excelente também!",
      result: "Configurei em 5 minutos",
      rating: 5
    }
  ];

  // Determinar quantos cards mostrar por vez baseado no tamanho da tela
  const getCardsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3; // lg breakpoint
    if (window.innerWidth >= 768) return 2;  // md breakpoint
    return 1;
  }, []);

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  // Atualizar cardsPerView quando a janela redimensionar
  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getCardsPerView]);

  // Auto-rotação
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = testimonials.length - cardsPerView;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, cardsPerView, testimonials.length]);

  // Navegação
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - cardsPerView;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  }, [cardsPerView, testimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - cardsPerView;
      return prev <= 0 ? maxIndex : prev - 1;
    });
  }, [cardsPerView, testimonials.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const maxIndex = testimonials.length - cardsPerView;
  const translateX = -(currentIndex * (100 / cardsPerView));

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

        {/* Carrossel Container */}
        <div 
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Botão Anterior */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-card hover:bg-accent text-foreground p-3 rounded-full shadow-card transition-all duration-300 hover:scale-110 border border-border"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Botão Próximo */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-card hover:bg-accent text-foreground p-3 rounded-full shadow-card transition-all duration-300 hover:scale-110 border border-border"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Track do Carrossel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${translateX}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <div className="bg-card p-6 rounded-xl shadow-card hover-lift border border-border h-full">
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
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores (dots) */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'w-8 bg-secondary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir para página ${index + 1}`}
              />
            ))}
          </div>
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
