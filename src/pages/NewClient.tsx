import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, User, Calendar, Save, MessageCircle } from "lucide-react";
import { openWhatsAppMessage, generateAnamnesisLink, formatDate } from "@/lib/whatsapp";
import { useCreateClient } from "@/hooks/useCreateClient";
import { useProcedures } from "@/hooks/useProcedures";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { confettiFireworks } from "@/lib/confetti";

const formSchema = z.object({
  // Dados do Cliente
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  dataNascimento: z.string().optional(),
  
  // Dados da Primeira Visita
  dataVisita: z.string().min(1, "Data da visita é obrigatória"),
  horaVisita: z.string().min(1, "Hora da visita é obrigatória"),
  notasGerais: z.string().optional(),
  
  // Procedimentos
  procedimentos: z.array(
    z.object({
      procedimentoId: z.string().min(1, "Selecione um procedimento"),
      nome: z.string(),
      preco: z.number(),
      observacoes: z.string().optional(),
    })
  ).min(1, "Adicione pelo menos um procedimento"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewClient() {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [enviarWhatsApp, setEnviarWhatsApp] = useState(true);
  
  const createClient = useCreateClient();
  const { data: procedimentosDisponiveis = [], isLoading: loadingProcedures, error: proceduresError } = useProcedures();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      whatsapp: "",
      dataNascimento: "",
      dataVisita: "",
      horaVisita: "",
      notasGerais: "",
      procedimentos: [
        { procedimentoId: "", nome: "", preco: 0, observacoes: "" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedimentos",
  });

  const handleProcedimentoChange = (index: number, procedimentoId: string) => {
    const procedimento = procedimentosDisponiveis.find(p => p.id === procedimentoId);
    if (procedimento) {
      form.setValue(`procedimentos.${index}.procedimentoId`, procedimentoId);
      form.setValue(`procedimentos.${index}.nome`, procedimento.nome);
      form.setValue(`procedimentos.${index}.preco`, procedimento.preco);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createClient.mutateAsync(data);
      
      // ✨ Celebrar primeiro cliente com confetti
      if (result.isFirstClient) {
        confettiFireworks();
        
        toast({
          title: "🎉 Parabéns pelo seu primeiro cliente!",
          description: "Este é o início de uma jornada incrível!",
        });
      } else {
        toast({
          title: "Cliente cadastrado com sucesso!",
          description: enviarWhatsApp 
            ? `${data.nome} foi adicionado e as mensagens foram enviadas via WhatsApp.` 
            : `${data.nome} foi adicionado ao sistema.`,
        });
      }
      
      // Enviar WhatsApp com ID REAL do banco
      if (enviarWhatsApp) {
        const fichaUrl = generateAnamnesisLink(result.client.id);
        const procedimentosNomes = data.procedimentos.map(p => p.nome);
        
        openWhatsAppMessage("EnvioFicha", {
          nomeCliente: data.nome,
          telefone: data.whatsapp,
          linkFicha: fichaUrl,
          nomeStudio: "FichaZen"
        });

        // Também enviar confirmação de agendamento
        if (data.dataVisita && data.horaVisita) {
          setTimeout(() => {
            openWhatsAppMessage("ConfirmacaoAgendamento", {
              nomeCliente: data.nome,
              telefone: data.whatsapp,
              dataProcedimento: formatDate(data.dataVisita),
              horaProcedimento: data.horaVisita,
              procedimentos: procedimentosNomes,
              nomeStudio: "FichaZen"
            });
          }, 1000);
        }
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      setShowExitDialog(true);
    } else {
      navigate("/dashboard");
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigate("/dashboard");
  };

  // Marcar formulário como modificado
  form.watch(() => setIsFormDirty(true));

  // Loading state
  if (loadingProcedures) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary-light">
        <LoadingSpinner message="Carregando procedimentos..." />
      </div>
    );
  }

  // Error state
  if (proceduresError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary-light flex items-center justify-center">
        <ErrorMessage message="Erro ao carregar procedimentos. Configure procedimentos em Configurações antes de cadastrar clientes." />
      </div>
    );
  }

  // Empty state
  if (procedimentosDisponiveis.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary-light flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar pelo menos um procedimento antes de adicionar clientes.
            </p>
            <Button onClick={() => navigate("/configuracoes/procedimentos")} variant="cta">
              Ir para Procedimentos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary-light">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-primary-light"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-primary-dark">Novo Cliente</h1>
                <p className="text-sm text-muted-foreground">Cadastre um novo cliente e sua primeira visita</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção 1: Dados do Cliente */}
            <Card className="shadow-card animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-dark">
                  <User className="h-5 w-5" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Maria Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp *</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Seção 2: Procedimentos da Primeira Visita */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-dark">
                  <Calendar className="h-5 w-5" />
                  Procedimentos da Primeira Visita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data e Hora da Visita */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-primary/10">
                  <FormField
                    control={form.control}
                    name="dataVisita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Visita *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaVisita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Lista de Procedimentos */}
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="bg-primary-light/30 border-primary/20">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`procedimentos.${index}.procedimentoId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Procedimento *</FormLabel>
                                  <Select
                                    onValueChange={(value) => handleProcedimentoChange(index, value)}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {procedimentosDisponiveis.map((proc) => (
                                        <SelectItem key={proc.id} value={proc.id}>
                                          {proc.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`procedimentos.${index}.preco`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Preço (R$)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      value={field.value}
                                      readOnly
                                      className="bg-muted"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="mt-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name={`procedimentos.${index}.observacoes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações (Opcional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ex: Cliente solicitou sobrancelha mais arqueada"
                                  className="resize-none"
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ procedimentoId: "", nome: "", preco: 0, observacoes: "" })}
                    className="w-full border-dashed border-2 hover:bg-primary-light"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar outro procedimento
                  </Button>
                </div>

                {/* Notas Gerais */}
                <FormField
                  control={form.control}
                  name="notasGerais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Gerais da Visita (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Cliente chegou atrasada, remarcamos para daqui a 2 semanas..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Opção de envio automático via WhatsApp */}
            <Card className="shadow-card animate-fade-in border-primary/20" style={{ animationDelay: "0.2s" }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="enviar-whatsapp"
                    checked={enviarWhatsApp}
                    onCheckedChange={(checked) => setEnviarWhatsApp(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="enviar-whatsapp"
                      className="text-sm font-semibold text-foreground cursor-pointer flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      Enviar mensagens via WhatsApp
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Após salvar, o WhatsApp será aberto com mensagem de boas-vindas e link da ficha de anamnese.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão de Salvar */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="cta" size="lg">
                <Save className="h-5 w-5 mr-2" />
                Salvar Cliente e Primeira Visita
              </Button>
            </div>
          </form>
        </Form>
      </main>

      {/* Dialog de Confirmação de Saída */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você possui dados não salvos. Tem certeza que deseja sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Descartar e sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
