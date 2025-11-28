import agendaPreview from "@/assets/agenda-preview.webp";

export const AgendaPreviewSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 animate-fade-in-up">
            Sua agenda da semana, sempre organizada
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 animate-fade-in-up">
            Visualize a semana e gerencie seus horários rapidamente
          </p>
          
          <div className="relative animate-fade-in">
            <div className="rounded-2xl overflow-hidden shadow-soft hover-lift">
              <img 
                src={agendaPreview} 
                alt="Visualização da agenda semanal do FichaZen" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
