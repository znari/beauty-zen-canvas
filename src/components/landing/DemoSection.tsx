import { useState, useEffect, useRef } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import agendaPreview from "@/assets/agenda-preview.jpg";

export const DemoSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // YouTube Video ID - substituir pelo ID real quando disponível
  const youtubeVideoId = "VIDEO_ID_AQUI";
  const hasRealVideo = youtubeVideoId !== "VIDEO_ID_AQUI";

  // Lazy loading - só carrega quando próximo da viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePlayClick = () => {
    if (hasRealVideo) {
      setIsVideoPlaying(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePlayClick();
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="demo" 
      className="py-20 bg-background"
      aria-labelledby="demo-heading"
    >
      {/* Preconnect para YouTube (performance) */}
      {isInView && (
        <link rel="preconnect" href="https://www.youtube.com" />
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 animate-fade-in-up">
            <span className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
              🎬 Demonstração
            </span>
            <h2 
              id="demo-heading"
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Veja o FichaZen em ação
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {hasRealVideo 
                ? "60 segundos para entender como o FichaZen transforma sua gestão de clientes"
                : "Interface intuitiva que você domina em minutos"
              }
            </p>
          </header>
          
          {/* Video Player Container */}
          <div className="relative animate-fade-in group">
            <div 
              className="rounded-2xl overflow-hidden shadow-soft hover-lift border-4 border-primary/20 bg-muted"
              style={{ aspectRatio: "16/9" }}
            >
              {!isVideoPlaying ? (
                // Thumbnail com botão play
                <div 
                  className="relative w-full h-full cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary/50 rounded-xl"
                  onClick={handlePlayClick}
                  onKeyDown={handleKeyDown}
                  role="button"
                  tabIndex={0}
                  aria-label={hasRealVideo ? "Reproduzir vídeo demonstrativo do FichaZen" : "Preview da interface do FichaZen"}
                >
                  {/* Thumbnail Image */}
                  <img 
                    src={agendaPreview} 
                    alt="Preview da interface do FichaZen - Dashboard com agenda de clientes e funcionalidades principais" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Dark overlay para melhor contraste do botão play */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                    aria-hidden="true"
                  />
                  
                  {/* Play Button */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <div className="relative">
                      {/* Pulse animation */}
                      <div className="absolute inset-0 w-24 h-24 md:w-28 md:h-28 rounded-full bg-secondary/30 animate-ping" />
                      
                      {/* Main play button */}
                      <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-secondary flex items-center justify-center shadow-button group-hover:scale-110 transition-transform duration-300">
                        <Play 
                          className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" 
                          fill="white" 
                          strokeWidth={0}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Video duration badge */}
                  {hasRealVideo && (
                    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <span>1:00</span>
                    </div>
                  )}

                  {/* "Assistir" label */}
                  <div className="absolute bottom-4 left-4 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {hasRealVideo ? "▶ Assistir demonstração" : "▶ Ver interface"}
                  </div>
                </div>
              ) : (
                // YouTube embed (lazy loaded)
                <div className="relative w-full h-full">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=pt`}
                    title="Demonstração do FichaZen - Sistema de gestão para profissionais de beleza"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Feature callouts - apenas quando vídeo não está tocando */}
            {!isVideoPlaying && (
              <>
                <div 
                  className="absolute -left-4 top-1/4 bg-card px-4 py-2 rounded-lg shadow-card border border-border hidden lg:block animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
                  aria-hidden="true"
                >
                  <p className="text-xs font-semibold text-foreground">📱 WhatsApp integrado</p>
                </div>
                
                <div 
                  className="absolute -right-4 top-1/2 bg-card px-4 py-2 rounded-lg shadow-card border border-border hidden lg:block animate-fade-in"
                  style={{ animationDelay: "0.5s" }}
                  aria-hidden="true"
                >
                  <p className="text-xs font-semibold text-foreground">📊 Relatórios completos</p>
                </div>
                
                <div 
                  className="absolute -left-4 bottom-1/4 bg-card px-4 py-2 rounded-lg shadow-card border border-border hidden lg:block animate-fade-in"
                  style={{ animationDelay: "0.7s" }}
                  aria-hidden="true"
                >
                  <p className="text-xs font-semibold text-foreground">📸 Galeria privada</p>
                </div>
              </>
            )}
          </div>

          {/* Video transcript for SEO (visually hidden) */}
          {hasRealVideo && (
            <div className="sr-only">
              <h3>Transcrição do vídeo demonstrativo</h3>
              <p>
                FichaZen é o sistema completo para profissionais de beleza. 
                Envie fichas de anamnese e confirmações direto pelo WhatsApp com apenas um clique.
                Controle total da sua agenda com status visuais: amarelo para pendente, verde para confirmado.
                Organize fotos de procedimentos em galeria privada, com antes e depois.
                Relatórios completos do seu faturamento com gráficos interativos e exportação em PDF.
                Comece grátis agora. Sem cartão de crédito. Quinze dias para testar todas as funcionalidades.
              </p>
            </div>
          )}

          {/* Key features/stats */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
            role="list"
            aria-label="Principais benefícios do FichaZen"
          >
            <div 
              className="text-center animate-fade-in-up p-4 rounded-xl bg-card/50 border border-border/50" 
              style={{ animationDelay: "0.2s" }}
              role="listitem"
            >
              <p className="text-2xl md:text-3xl font-bold text-secondary mb-1">1 clique</p>
              <p className="text-sm text-muted-foreground">Enviar ficha</p>
            </div>
            <div 
              className="text-center animate-fade-in-up p-4 rounded-xl bg-card/50 border border-border/50" 
              style={{ animationDelay: "0.3s" }}
              role="listitem"
            >
              <p className="text-2xl md:text-3xl font-bold text-secondary mb-1">5 min</p>
              <p className="text-sm text-muted-foreground">Configuração inicial</p>
            </div>
            <div 
              className="text-center animate-fade-in-up p-4 rounded-xl bg-card/50 border border-border/50" 
              style={{ animationDelay: "0.4s" }}
              role="listitem"
            >
              <p className="text-2xl md:text-3xl font-bold text-secondary mb-1">100%</p>
              <p className="text-sm text-muted-foreground">Responsivo</p>
            </div>
            <div 
              className="text-center animate-fade-in-up p-4 rounded-xl bg-card/50 border border-border/50" 
              style={{ animationDelay: "0.5s" }}
              role="listitem"
            >
              <p className="text-2xl md:text-3xl font-bold text-secondary mb-1">Grátis</p>
              <p className="text-sm text-muted-foreground">15 dias de teste</p>
            </div>
          </div>

          {/* CTA after video */}
          <div className="text-center mt-10 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <a 
              href="/cadastro"
              className="inline-flex items-center gap-2 gradient-button text-white px-8 py-4 rounded-2xl font-semibold shadow-button hover:shadow-hover hover:scale-[1.02] transition-all duration-300"
            >
              Começar teste grátis agora
            </a>
            <p className="text-sm text-muted-foreground mt-3">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>

      {/* Schema.org VideoObject for SEO */}
      {hasRealVideo && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "Demonstração do FichaZen - Sistema de gestão para profissionais de beleza",
            "description": "Veja como o FichaZen ajuda profissionais de beleza a gerenciar clientes, fichas de anamnese, agenda e faturamento em um único lugar.",
            "thumbnailUrl": agendaPreview,
            "uploadDate": "2024-01-01",
            "duration": "PT1M",
            "contentUrl": `https://www.youtube.com/watch?v=${youtubeVideoId}`,
            "embedUrl": `https://www.youtube.com/embed/${youtubeVideoId}`,
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": { "@type": "WatchAction" },
              "userInteractionCount": 500
            }
          })
        }} />
      )}
    </section>
  );
};
