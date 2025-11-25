import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, Eye, Copy, MessageCircle } from "lucide-react";
import { gerarPreviewMensagem, type TemplateSelectorType } from "@/lib/whatsapp";
import { toast } from "sonner";
import type { MessageTemplate } from "@/hooks/useMessageTemplates";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: TemplateSelectorType;
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
  clientData?: {
    nomeCliente: string;
    dataProcedimento?: string;
    horaProcedimento?: string;
  };
}

export default function TemplateSelector({
  open,
  onOpenChange,
  tipo,
  templates,
  onSelect,
  clientData,
}: TemplateSelectorProps) {
  // Se tipo for "Todos", mostrar todos os templates, caso contrário filtrar por tipo
  const filteredTemplates = tipo === "Todos" 
    ? templates 
    : templates.filter((t) => t.tipo === tipo);
  
  // Agrupar templates por tipo para melhor organização visual
  const templatesByType = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.tipo]) acc[template.tipo] = [];
    acc[template.tipo].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  // Mapeamento de tipos para badges coloridas
  const typeLabels: Record<string, { label: string; color: string }> = {
    Confirmacao: { label: "Confirmação", color: "bg-blue-100 text-blue-800 border-blue-300" },
    EnvioFicha: { label: "Envio de Ficha", color: "bg-purple-100 text-purple-800 border-purple-300" },
    Lembrete: { label: "Lembrete", color: "bg-orange-100 text-orange-800 border-orange-300" },
    Agradecimento: { label: "Agradecimento", color: "bg-pink-100 text-pink-800 border-pink-300" },
    BoasVindas: { label: "Boas-Vindas", color: "bg-green-100 text-green-800 border-green-300" },
    Reagendamento: { label: "Reagendamento", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    Cancelamento: { label: "Cancelamento", color: "bg-red-100 text-red-800 border-red-300" },
  };
  const defaultTemplate = filteredTemplates.find((t) => t.is_padrao);
  const [selectedId, setSelectedId] = useState<string>(defaultTemplate?.id || "");
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);

  const handleConfirm = () => {
    const selected = filteredTemplates.find((t) => t.id === selectedId);
    if (selected) {
      onSelect(selected);
      onOpenChange(false);
    }
  };

  const generateCustomPreview = (conteudo: string) => {
    if (!clientData) return gerarPreviewMensagem(conteudo);

    let preview = conteudo;
    preview = preview.replace(/\[nomeCliente\]/g, clientData.nomeCliente);
    if (clientData.dataProcedimento) {
      preview = preview.replace(/\[dataProcedimento\]/g, clientData.dataProcedimento);
    }
    if (clientData.horaProcedimento) {
      preview = preview.replace(/\[horaProcedimento\]/g, clientData.horaProcedimento);
    }
    preview = preview.replace(/\[nomeStudio\]/g, "FichaZen");
    preview = preview.replace(/\[linkFicha\]/g, "https://fichazen.app/ficha/123");

    return preview;
  };

  const handleCopyMessage = async (template: MessageTemplate) => {
    const message = generateCustomPreview(template.conteudo);
    
    try {
      await navigator.clipboard.writeText(message);
      toast.success("✅ Mensagem copiada! Cole no WhatsApp do cliente.");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao copiar mensagem");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Escolha um Template</DialogTitle>
            <DialogDescription>
              Selecione o template de mensagem que deseja enviar
            </DialogDescription>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-yellow-800">
                💡 <strong>Dica:</strong> Se o WhatsApp não abrir automaticamente, 
                use o botão "Copiar Mensagem" e cole diretamente no chat do cliente.
              </p>
            </div>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={selectedId} onValueChange={setSelectedId}>
              <div className="space-y-3">
                {filteredTemplates.map((template) => {
                  const typeInfo = typeLabels[template.tipo] || { 
                    label: template.tipo, 
                    color: "bg-gray-100 text-gray-800 border-gray-300" 
                  };
                  
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedId === template.id
                          ? "border-2 border-primary shadow-md"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedId(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={template.id} id={template.id} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Label
                                htmlFor={template.id}
                                className="font-semibold cursor-pointer"
                              >
                                {template.nome}
                              </Label>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${typeInfo.color} border`}
                              >
                                {typeInfo.label}
                              </Badge>
                              {template.is_padrao && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                                  Padrão
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {template.conteudo.substring(0, 100)}
                              {template.conteudo.length > 100 && "..."}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(template);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum template disponível para este tipo de mensagem.</p>
                <p className="text-sm mt-2">
                  Crie templates em Configurações → Mensagens do WhatsApp
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                const selected = filteredTemplates.find((t) => t.id === selectedId);
                if (selected) {
                  handleCopyMessage(selected);
                }
              }}
              disabled={!selectedId}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar Mensagem
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedId}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview do Template</DialogTitle>
            <DialogDescription>
              Veja como a mensagem será enviada
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="py-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <div className="bg-green-500 text-white rounded-full p-2">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">WhatsApp</p>
                      <p className="text-xs text-muted-foreground">
                        {previewTemplate.nome}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">
                      {generateCustomPreview(previewTemplate.conteudo)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setPreviewTemplate(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
