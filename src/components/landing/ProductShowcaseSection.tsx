import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Camera } from "lucide-react";
import agendaPreview from "@/assets/agenda-preview.webp";

export const ProductShowcaseSection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Veja o FichaZen em Ação
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça as principais funcionalidades que vão transformar a gestão do seu estúdio
          </p>
        </div>

        <Tabs defaultValue="agenda" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-2">
            <TabsTrigger value="agenda" className="flex items-center gap-2 py-3 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Agenda Inteligente</span>
              <span className="sm:hidden">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="ficha" className="flex items-center gap-2 py-3 text-sm sm:text-base">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Ficha Digital</span>
              <span className="sm:hidden">Ficha</span>
            </TabsTrigger>
            <TabsTrigger value="galeria" className="flex items-center gap-2 py-3 text-sm sm:text-base">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Galeria de Fotos</span>
              <span className="sm:hidden">Galeria</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="space-y-6 animate-fade-in">
            <div className="bg-background rounded-3xl shadow-soft overflow-hidden border border-border/50">
              <img 
                src={agendaPreview} 
                alt="Agenda semanal do FichaZen mostrando agendamentos organizados por dia"
                className="w-full h-auto"
              />
            </div>
            <div className="text-center space-y-2 px-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                Visualize sua semana completa de forma intuitiva
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Status coloridos facilitam o controle: <span className="text-yellow-600 font-semibold">Amarelo</span> para fichas pendentes, 
                <span className="text-green-600 font-semibold"> Verde</span> para confirmados, 
                <span className="text-red-600 font-semibold"> Vermelho</span> para cancelados
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ficha" className="space-y-6 animate-fade-in">
            <div className="bg-background rounded-3xl shadow-soft overflow-hidden border border-border/50 p-8 sm:p-12">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">Ficha de Anamnese Digital</h4>
                    <p className="text-sm text-muted-foreground">Personalizada para o seu negócio</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "Já fez algum procedimento estético antes?",
                    "Possui alergias ou condições de saúde?",
                    "Está grávida ou amamentando?",
                    "Faz uso de medicamentos regularmente?",
                    "Qual resultado você espera alcançar?"
                  ].map((question, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border/30">
                      <p className="text-sm font-medium text-foreground mb-2">{question}</p>
                      <div className="h-8 bg-background rounded border border-border/50"></div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded border-2 border-secondary"></div>
                  <span>Li e concordo com os termos de consentimento</span>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2 px-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                Fichas personalizadas enviadas direto no WhatsApp
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cliente preenche antes da consulta e você economiza 15 minutos por atendimento. 
                Tudo salvo automaticamente na nuvem.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="galeria" className="space-y-6 animate-fade-in">
            <div className="bg-background rounded-3xl shadow-soft overflow-hidden border border-border/50 p-8 sm:p-12">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">Galeria Privada de Fotos</h4>
                    <p className="text-sm text-muted-foreground">Antes e depois organizados por visita</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div 
                      key={index} 
                      className="aspect-square bg-gradient-to-br from-muted via-muted/50 to-background rounded-lg border border-border/50 flex items-center justify-center group hover:border-secondary/50 transition-colors"
                    >
                      <Camera className="w-8 h-8 text-muted-foreground/40 group-hover:text-secondary/60 transition-colors" />
                    </div>
                  ))}
                </div>

                <div className="pt-6 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">6 fotos • Visita 23/11/2025</span>
                  </div>
                  <span className="text-secondary font-medium">Criptografado 🔒</span>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2 px-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                Evolução dos seus clientes documentada com segurança
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fotos antes e depois organizadas por data. Armazenamento privado e criptografado 
                com acesso exclusivo através de login seguro.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
