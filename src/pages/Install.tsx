import { useState } from "react";
import { Download, Smartphone, Share, Menu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Install = () => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const navigate = useNavigate();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    
    if (success) {
      toast.success("FichaZen instalado com sucesso!");
      setTimeout(() => navigate("/dashboard"), 1500);
    }
    setIsInstalling(false);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              App já instalado!
            </h1>
            <p className="text-muted-foreground">
              O FichaZen já está instalado no seu dispositivo. Acesse direto do ícone na tela inicial.
            </p>
          </div>
          
          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Ir para o Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Download className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Instale o FichaZen
            </h1>
            <p className="text-xl text-muted-foreground">
              Acesse seu sistema de gestão direto da tela inicial do seu dispositivo
            </p>
          </div>

          {/* Benefícios */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Por que instalar?
            </h2>
            <div className="grid gap-4">
              {[
                { icon: Smartphone, text: "Acesso instantâneo da tela inicial" },
                { icon: Download, text: "Funciona offline com dados em cache" },
                { icon: CheckCircle2, text: "Experiência de app nativo" },
                { icon: Menu, text: "Sem ocupar espaço na memória" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground">{benefit.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Instruções de instalação */}
          {canInstall && !isIOS && (
            <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Pronto para instalar!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Clique no botão abaixo para adicionar o FichaZen à sua tela inicial
                </p>
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  size="lg"
                  className="w-full max-w-sm"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isInstalling ? "Instalando..." : "Instalar Agora"}
                </Button>
              </div>
            </Card>
          )}

          {/* Instruções para iOS */}
          {isIOS && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Como instalar no iPhone/iPad
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <p className="text-foreground font-medium">Toque no botão Compartilhar</p>
                    <p className="text-sm text-muted-foreground">
                      <Share className="w-4 h-4 inline mr-1" />
                      Ícone no meio da barra inferior do Safari
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <p className="text-foreground font-medium">Role e selecione "Adicionar à Tela de Início"</p>
                    <p className="text-sm text-muted-foreground">
                      Pode ser necessário rolar a lista de opções
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <p className="text-foreground font-medium">Confirme tocando em "Adicionar"</p>
                    <p className="text-sm text-muted-foreground">
                      O ícone do FichaZen aparecerá na sua tela inicial
                    </p>
                  </div>
                </li>
              </ol>
            </Card>
          )}

          {/* Instruções para Android (quando não tem prompt) */}
          {!canInstall && !isIOS && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Como instalar no Android
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <p className="text-foreground font-medium">Abra o menu do navegador</p>
                    <p className="text-sm text-muted-foreground">
                      <Menu className="w-4 h-4 inline mr-1" />
                      Toque nos três pontos no canto superior direito
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <p className="text-foreground font-medium">Selecione "Instalar app" ou "Adicionar à tela inicial"</p>
                    <p className="text-sm text-muted-foreground">
                      O texto pode variar dependendo do navegador
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <p className="text-foreground font-medium">Confirme a instalação</p>
                    <p className="text-sm text-muted-foreground">
                      O FichaZen será adicionado à sua gaveta de apps
                    </p>
                  </div>
                </li>
              </ol>
            </Card>
          )}

          {/* Botão voltar */}
          <div className="text-center">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="lg"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Install;
