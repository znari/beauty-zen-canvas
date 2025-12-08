import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroMockup from "@/assets/hero-mockup.jpg";

export const HeroSection = () => {
  return (
    <section id="hero" className="relative pt-24 pb-16 sm:pt-28 md:pt-40 sm:pb-20 md:pb-32 overflow-hidden">
      {/* Background gradient refinado para foco visual */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy de Alta Conversão */}
          <div className="space-y-8 animate-fade-in-up relative z-20 text-center lg:text-left">
            
            {/* Badge de "Novidade/Destaque" */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mx-auto lg:mx-0">
              <Star className="w-4 h-4 fill-current" />
              <span>Plataforma nº 1 para Estética e Beleza</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                <span className="text-primary block mb-2">Adeus papelada.</span>
                Seu estúdio organizado em <span className="text-secondary underline decoration-wavy decoration-2 underline-offset-4">1 clique.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                Profissionalize seu atendimento e garanta que o cliente volte. 
                Tenha <strong>fichas de anamnese</strong>, <strong>agenda inteligente</strong> e <strong>controle financeiro</strong> na palma da sua mão.
              </p>
            </div>

            {/* CTAs Agressivos */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="default" 
                size="xl" 
                asChild 
                className="group shadow-xl bg-primary hover:bg-primary/90 text-lg px-8 h-14 transition-all duration-300 transform hover:-translate-y-1 animate-pulse"
              >
                <Link to="/registro">
                  Começar Grátis Sem Cartão
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              {/* Link Secundário de "Saiba Mais" para quem ainda não está pronto */}
              <Button variant="outline" size="xl" asChild className="h-14 border-2 hover:bg-accent/50">
                <a href="#funcionalidades">
                  Ver Funcionalidades
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground/80 font-medium">
              ⚡ Instalação em 30 segundos • Cancelamento a qualquer momento
            </p>

            {/* Trust Badges - Reforço de Confiança */}
            <div className="pt-8 border-t border-border/50 grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-foreground font-semibold">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>Seguro</span>
                </div>
                <p className="text-xs text-muted-foreground">Dados Criptografados</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-foreground font-semibold">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>Rápido</span>
                </div>
                <p className="text-xs text-muted-foreground">Funciona Offline</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-foreground font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span>Completo</span>
                </div>
                <p className="text-xs text-muted-foreground">Tudo em um app</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Otimizado */}
          <div className="relative animate-fade-in hidden md:block">
            <div className="relative z-10 transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-2xl transform rotate-6 scale-95 -z-10"></div>
              <img 
                src={heroMockup} 
                alt="FichaZen App Dashboard - Gestão Simples" 
                className="w-full h-auto rounded-2xl shadow-2xl border border-white/20" 
              />
              
              {/* Elemento Flutuante "Dinheiro no Bolso" - Psicologia Visual */}
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Receita Hoje</p>
                    <p className="text-lg font-bold text-foreground">R$ 850,00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
