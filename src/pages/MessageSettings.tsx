import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageCircle, Eye, Plus, Edit2, Trash2, Star, Copy, ArrowLeft, Lock } from "lucide-react";
import { messageTemplates, gerarPreviewMensagem, type MessageType } from "@/lib/whatsapp";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  useMessageTemplates, 
  useCreateTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate, 
  useSetDefaultTemplate,
  useDuplicateTemplate,
  type MessageTemplate 
} from "@/hooks/useMessageTemplates";
import { useBlockedActions } from "@/hooks/useBlockedActions";

const messageTypeLabels: Record<MessageType, string> = {
  ConfirmacaoAgendamento: "Confirmação de Agendamento",
  EnvioFicha: "Envio de Ficha",
  Lembrete: "Lembrete",
  Agradecimento: "Agradecimento",
  BoasVindas: "Boas-Vindas",
  Reagendamento: "Reagendamento",
  Cancelamento: "Cancelamento",
};

export default function MessageSettings() {
  const navigate = useNavigate();
  const { checkPermission, isBlocked } = useBlockedActions();
  const { data: templates = [], isLoading } = useMessageTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const setDefaultTemplate = useSetDefaultTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [filterType, setFilterType] = useState<MessageType | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<{
    nome: string;
    tipo: MessageType;
    conteudo: string;
  }>({
    nome: "",
    tipo: "ConfirmacaoAgendamento",
    conteudo: "",
  });

  const filteredTemplates =
    filterType === "all"
      ? templates
      : templates.filter((t) => t.tipo === filterType);

  const handleAddTemplate = async () => {
    if (!checkPermission('create')) return;
    if (!newTemplate.nome || !newTemplate.conteudo || !newTemplate.tipo) {
      toast.error("Preencha todos os campos");
      return;
    }

    await createTemplate.mutateAsync({
      nome: newTemplate.nome,
      tipo: newTemplate.tipo,
      conteudo: newTemplate.conteudo,
      is_padrao: false,
    });

    setNewTemplate({ nome: "", tipo: "ConfirmacaoAgendamento", conteudo: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditTemplate = async () => {
    if (!checkPermission('edit')) return;
    if (!selectedTemplate) return;

    await updateTemplate.mutateAsync({
      id: selectedTemplate.id,
      nome: selectedTemplate.nome,
      tipo: selectedTemplate.tipo,
      conteudo: selectedTemplate.conteudo,
    });

    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!checkPermission('delete')) return;
    const template = templates.find((t) => t.id === id);
    if (template?.is_padrao) {
      toast.error("Não é possível excluir templates padrão");
      return;
    }

    await deleteTemplate.mutateAsync(id);
    setDeleteTemplateId(null);
  };

  const handleDuplicateTemplate = async (template: MessageTemplate) => {
    if (!checkPermission('create')) return;
    await duplicateTemplate.mutateAsync(template);
  };

  const handleSetAsDefault = async (id: string) => {
    if (!checkPermission('edit')) return;
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    await setDefaultTemplate.mutateAsync({
      id: template.id,
      tipo: template.tipo,
    });
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-primary-light"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-primary-dark">
                  Templates de Mensagens
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie seus templates personalizados de WhatsApp
                </p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg" disabled={isBlocked}>
                  {isBlocked ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {isBlocked ? "Bloqueado" : "Novo Template"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Crie um template personalizado para suas mensagens do WhatsApp
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-nome">Nome do Template</Label>
                      <Input
                        id="new-nome"
                        placeholder="Ex: Confirmação Especial"
                        value={newTemplate.nome}
                        onChange={(e) =>
                          setNewTemplate({ ...newTemplate, nome: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-tipo">Tipo de Mensagem</Label>
                      <Select
                        value={newTemplate.tipo}
                        onValueChange={(value) =>
                          setNewTemplate({
                            ...newTemplate,
                            tipo: value as MessageType,
                          })
                        }
                      >
                        <SelectTrigger id="new-tipo">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(messageTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-conteudo">Conteúdo da Mensagem</Label>
                    <Textarea
                      id="new-conteudo"
                      placeholder="Digite o conteúdo da mensagem..."
                      value={newTemplate.conteudo}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, conteudo: e.target.value })
                      }
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use: [nomeCliente], [dataProcedimento], [horaProcedimento], [linkFicha],
                      [nomeStudio]
                    </p>
                  </div>
                  <Card className="bg-blue-50/50 border-blue-200">
                    <CardContent className="pt-4">
                      <p className="text-xs text-blue-700">
                        <strong>Preview:</strong>
                      </p>
                      <p className="text-sm text-blue-900 mt-2 whitespace-pre-wrap">
                        {newTemplate.conteudo
                          ? gerarPreviewMensagem(newTemplate.conteudo)
                          : "Digite o conteúdo para ver o preview..."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddTemplate}>Criar Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Info Card */}
        <Card className="bg-blue-50/50 border-blue-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">💡 Como funciona</p>
                <p className="text-sm text-blue-700">
                  Crie múltiplos templates para cada tipo de mensagem. Ao enviar uma mensagem
                  via WhatsApp, você poderá escolher qual template usar. O template marcado
                  com ⭐ será usado por padrão.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Label htmlFor="filter-type">Filtrar por tipo:</Label>
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as MessageType | "all")}
          >
            <SelectTrigger id="filter-type" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(messageTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-auto">
            {filteredTemplates.length} template(s)
          </Badge>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`shadow-card hover:shadow-lg transition-all ${
                template.is_padrao ? "border-2 border-primary" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.is_padrao && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {template.nome}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {messageTypeLabels[template.tipo]}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/30 p-3 rounded-lg text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {template.conteudo.substring(0, 150)}
                  {template.conteudo.length > 150 && "..."}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!template.is_padrao && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetAsDefault(template.id)}
                      className="flex-1"
                      disabled={isBlocked}
                    >
                      {isBlocked ? <Lock className="h-3 w-3 mr-1" /> : <Star className="h-3 w-3 mr-1" />}
                      {isBlocked ? "Bloqueado" : "Tornar Padrão"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditDialogOpen(true);
                    }}
                    disabled={isBlocked}
                  >
                    {isBlocked ? <Lock className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                    disabled={isBlocked}
                  >
                    {isBlocked ? <Lock className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  {!template.is_padrao && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTemplateId(template.id)}
                      disabled={isBlocked}
                    >
                      {isBlocked ? <Lock className="h-3 w-3" /> : <Trash2 className="h-3 w-3 text-destructive" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">
                Nenhum template encontrado para este tipo
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} disabled={isBlocked}>
                {isBlocked ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isBlocked ? "Bloqueado" : "Criar Primeiro Template"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>Modifique o template de mensagem</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome do Template</Label>
                  <Input
                    id="edit-nome"
                    value={selectedTemplate.nome}
                    onChange={(e) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        nome: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tipo">Tipo de Mensagem</Label>
                  <Select
                    value={selectedTemplate.tipo}
                    onValueChange={(value) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        tipo: value as MessageType,
                      })
                    }
                  >
                    <SelectTrigger id="edit-tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(messageTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-conteudo">Conteúdo da Mensagem</Label>
                <Textarea
                  id="edit-conteudo"
                  value={selectedTemplate.conteudo}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      conteudo: e.target.value,
                    })
                  }
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <Card className="bg-blue-50/50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-xs text-blue-700">
                    <strong>Preview:</strong>
                  </p>
                  <p className="text-sm text-blue-900 mt-2 whitespace-pre-wrap">
                    {gerarPreviewMensagem(selectedTemplate.conteudo)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditTemplate}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTemplateId}
        onOpenChange={() => setDeleteTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTemplateId && handleDeleteTemplate(deleteTemplateId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
