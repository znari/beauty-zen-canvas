import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Eye } from "lucide-react";
import { messageTemplates, gerarPreviewMensagem, type MessageType } from "@/lib/whatsapp";
import { toast } from "sonner";

const messageLabels: Record<MessageType, string> = {
  ConfirmacaoAgendamento: "Confirmação de Agendamento",
  EnvioFicha: "Envio de Ficha de Anamnese",
  Lembrete: "Lembrete de Agendamento",
  Agradecimento: "Mensagem de Agradecimento",
  BoasVindas: "Boas-Vindas",
  Reagendamento: "Reagendamento",
  Cancelamento: "Cancelamento",
};

export default function MessageSettings() {
  const [templates, setTemplates] = useState({ ...messageTemplates });
  const [selectedType, setSelectedType] = useState<MessageType>("EnvioFicha");

  const handleSave = () => {
    // Aqui seria salvo no backend/localStorage
    // Por enquanto, apenas mostra feedback
    toast.success("Mensagens salvas com sucesso!");
  };

  const handleReset = (type: MessageType) => {
    setTemplates({
      ...templates,
      [type]: messageTemplates[type],
    });
    toast.info("Mensagem restaurada para o padrão");
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary-dark">
                Mensagens do WhatsApp
              </h1>
              <p className="text-sm text-muted-foreground">
                Personalize as mensagens enviadas automaticamente via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    💡 Como usar as variáveis
                  </p>
                  <p className="text-sm text-blue-700">
                    Use as variáveis entre colchetes para personalizar suas mensagens.
                    Elas serão substituídas automaticamente pelos dados reais do cliente
                    quando a mensagem for enviada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor de mensagens */}
        <div className="space-y-6">
          {Object.entries(messageLabels).map(([type, label]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  {label}
                </CardTitle>
                <CardDescription>
                  Use variáveis: [nomeCliente], [dataProcedimento], [horaProcedimento], [linkFicha], [nomeStudio]
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`msg-${type}`}>Mensagem</Label>
                  <Textarea
                    id={`msg-${type}`}
                    value={templates[type as MessageType]}
                    onChange={(e) => {
                      setTemplates({
                        ...templates,
                        [type]: e.target.value,
                      });
                    }}
                    onFocus={() => setSelectedType(type as MessageType)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReset(type as MessageType)}
                  >
                    Restaurar Padrão
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              Salvar Todas as Mensagens
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pré-visualização
              </CardTitle>
              <CardDescription>
                Veja como a mensagem ficará com dados reais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-green-500 text-white rounded-full p-2">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">WhatsApp</p>
                      <p className="text-xs text-muted-foreground">Mensagem automática</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {messageLabels[selectedType]}
                    </p>
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap text-sm">
                        {gerarPreviewMensagem(templates[selectedType])}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      💡 As variáveis serão substituídas automaticamente pelos dados reais do cliente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legenda de variáveis */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Variáveis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="text-xs bg-muted px-2 py-1 rounded">[nomeCliente]</code>
                  <span className="text-muted-foreground">Nome do cliente</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-xs bg-muted px-2 py-1 rounded">[dataProcedimento]</code>
                  <span className="text-muted-foreground">Data da visita</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-xs bg-muted px-2 py-1 rounded">[horaProcedimento]</code>
                  <span className="text-muted-foreground">Hora da visita</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-xs bg-muted px-2 py-1 rounded">[linkFicha]</code>
                  <span className="text-muted-foreground">Link da anamnese</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-xs bg-muted px-2 py-1 rounded">[nomeStudio]</code>
                  <span className="text-muted-foreground">Nome do estúdio</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
    </div>
  );
}
