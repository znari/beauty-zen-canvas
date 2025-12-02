import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Save } from "lucide-react";
import { useMessageTemplates, useUpdateTemplate } from "@/hooks/useMessageTemplates";
import { gerarPreviewMensagem } from "@/lib/whatsapp";
import { toast } from "sonner";

interface MessagesStepProps {
  onValidChange: (isValid: boolean) => void;
}

export function MessagesStep({ onValidChange }: MessagesStepProps) {
  const { data: templates = [] } = useMessageTemplates();
  const updateTemplate = useUpdateTemplate();
  const [customMessage, setCustomMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Get the default "BoasVindas" template
  const welcomeTemplate = templates.find(
    (t) => t.tipo === "BoasVindas" && t.is_padrao
  );

  useEffect(() => {
    if (welcomeTemplate) {
      setCustomMessage(welcomeTemplate.conteudo);
    }
  }, [welcomeTemplate]);

  useEffect(() => {
    // This step is always optional, so always valid
    onValidChange(true);
  }, [onValidChange]);

  const handleSave = async () => {
    if (!welcomeTemplate) {
      toast.error("Template de boas-vindas não encontrado");
      return;
    }

    setSaving(true);
    try {
      await updateTemplate.mutateAsync({
        id: welcomeTemplate.id,
        nome: welcomeTemplate.nome,
        tipo: welcomeTemplate.tipo,
        conteudo: customMessage,
      });
      toast.success("Mensagem de boas-vindas personalizada!");
    } catch (error) {
      toast.error("Erro ao salvar mensagem");
    } finally {
      setSaving(false);
    }
  };

  if (!welcomeTemplate) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Personalize a mensagem de boas-vindas que será enviada aos seus novos clientes (opcional).
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="welcome-message">Mensagem de Boas-Vindas</Label>
          <Textarea
            id="welcome-message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={8}
            placeholder="Digite sua mensagem de boas-vindas..."
            className="font-mono text-sm"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Use: [nomeCliente], [nomeStudio]
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Mensagem"}
        </Button>
      </div>

      {/* Preview */}
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-900 mb-2">Preview da Mensagem:</p>
            <p className="text-sm text-blue-900 whitespace-pre-wrap">
              {customMessage
                ? gerarPreviewMensagem(customMessage)
                : "Digite o conteúdo para ver o preview..."}
            </p>
          </div>
        </div>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900 text-center">
          💡 <strong>Esta etapa é opcional.</strong> Você pode personalizar mensagens depois em{" "}
          <strong>Configurações → Mensagens</strong>
        </p>
      </div>
    </div>
  );
}
