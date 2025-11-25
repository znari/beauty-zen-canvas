import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Calendar, MessageCircle, User } from "lucide-react";
import { openWhatsAppMessage, formatDate } from "@/lib/whatsapp";
import { useCreateVisit } from "@/hooks/useCreateVisit";
import { useProcedures } from "@/hooks/useProcedures";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

const formSchema = z.object({
  dataVisita: z.string().min(1, "Data da visita é obrigatória"),
  horaVisita: z.string().min(1, "Hora da visita é obrigatória"),
  profissionalId: z.string().optional(),
  notasGerais: z.string().optional(),
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

export default function NewVisit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enviarWhatsApp, setEnviarWhatsApp] = useState(true);
  
  const createVisit = useCreateVisit();
  const { data: client, isLoading: loadingClient, error: clientError } = useClientProfile(id!);
  const { data: procedimentosDisponiveis = [], isLoading: loadingProcedures } = useProcedures();
  const { data: teamMembers = [], isLoading: loadingTeam } = useTeamMembers(true);
  
  const ownerMember = teamMembers.find(m => m.is_owner);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataVisita: "",
      horaVisita: "",
      profissionalId: "",
      notasGerais: "",
      procedimentos: [
        { procedimentoId: "", nome: "", preco: 0, observacoes: "" }
      ],
    },
  });

  // Set default professional when loaded
  const profissionalIdValue = form.watch("profissionalId");
  if (ownerMember && !profissionalIdValue) {
    form.setValue("profissionalId", ownerMember.id);
  }

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
    if (!client) return;

    try {
      await createVisit.mutateAsync({
        clientId: id!,
        visit_date: data.dataVisita,
        visit_time: data.horaVisita,
        procedures: data.procedimentos.map(p => ({
          id: p.procedimentoId,
          nome: p.nome,
          preco: p.preco,
          observacoes: p.observacoes
        })),
        notes: data.notasGerais,
        assigned_professional_id: data.profissionalId,
      });
      
      // Enviar WhatsApp
      if (enviarWhatsApp && client.phone) {
        const procedimentosNomes = data.procedimentos.map(p => p.nome);
        
        openWhatsAppMessage("ConfirmacaoAgendamento", {
          nomeCliente: client.name,
          telefone: client.phone,
          dataProcedimento: formatDate(data.dataVisita),
          horaProcedimento: data.horaVisita,
          procedimentos: procedimentosNomes,
          nomeStudio: "FichaZen"
        });
      }
      
      toast({
        title: "Visita agendada com sucesso!",
        description: `Visita para ${client.name} foi agendada para ${formatDate(data.dataVisita)} às ${data.horaVisita}.`,
      });
      
      navigate(`/cliente/${id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao agendar visita",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    }
  };

  if (loadingClient || loadingProcedures || loadingTeam) {
    return <LoadingSpinner message="Carregando dados..." />;
  }

  if (clientError || !client) {
    return (
      <div className="min-h-screen gradient-hero p-8">
        <ErrorMessage message="Cliente não encontrado." />
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <header className="bg-card/90 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/cliente/${id}`)}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Nova Visita para {client.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Agende uma nova visita para este cliente
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <Card className="shadow-soft animate-fade-in bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Nome</p>
                    <p className="font-semibold text-lg text-foreground">{client.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">WhatsApp</p>
                    <p className="font-semibold text-lg text-foreground">{client.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Última Visita</p>
                  <p className="font-semibold text-foreground">{client.lastVisit}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <FormLabel>Horário *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profissionalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profissional Responsável</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} {member.is_owner && "(Você)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-foreground">Procedimentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-muted/50 border-border">
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
                  className="w-full border-dashed border-2 hover:bg-accent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar outro procedimento
                </Button>

                <FormField
                  control={form.control}
                  name="notasGerais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Gerais (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Cliente preferiu horário da tarde..."
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

            <Card className="shadow-soft animate-fade-in border-border" style={{ animationDelay: "0.3s" }}>
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
                      className="text-sm font-semibold cursor-pointer flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      Enviar confirmação via WhatsApp
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Abre o WhatsApp com mensagem de confirmação pronta para enviar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/cliente/${id}`)}
                disabled={createVisit.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="cta"
                disabled={createVisit.isPending}
                className="min-w-[200px]"
              >
                {createVisit.isPending ? "Agendando..." : "Agendar Visita"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
