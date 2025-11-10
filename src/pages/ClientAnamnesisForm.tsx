import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Save, Calendar, User } from "lucide-react";
import { useClientAnamnesis } from "@/hooks/useClientAnamnesis";
import { useSaveAnamnesis } from "@/hooks/useSaveAnamnesis";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

// Schema de validação
const anamnesisSchema = z.object({
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  q1_alergia: z.enum(["sim", "nao"]),
  q1_alergia_details: z.string().optional(),
  q2_medicamento: z.enum(["sim", "nao"]),
  q2_medicamento_details: z.string().optional(),
  q3_doenca: z.enum(["sim", "nao"]),
  q3_doenca_details: z.string().optional(),
  q4_gravida: z.enum(["sim", "nao"]),
  q5_observacao: z.enum(["sim", "nao"]),
  q5_observacao_details: z.string().optional(),
  consentimento: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar o consentimento para continuar",
  }),
});

type AnamnesisFormData = z.infer<typeof anamnesisSchema>;

const ClientAnamnesisForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar dados reais do banco
  const { data: client, isLoading, error } = useClientAnamnesis(id!);
  const saveMutation = useSaveAnamnesis();

  // useForm sempre ANTES de qualquer return condicional
  const form = useForm<AnamnesisFormData>({
    resolver: zodResolver(anamnesisSchema),
    defaultValues: {
      dataNascimento: client?.dateOfBirth || "",
      q1_alergia: "nao",
      q1_alergia_details: "",
      q2_medicamento: "nao",
      q2_medicamento_details: "",
      q3_doenca: "nao",
      q3_doenca_details: "",
      q4_gravida: "nao",
      q5_observacao: "nao",
      q5_observacao_details: "",
      consentimento: client?.anamnesis?.consent || false,
      ...(client?.anamnesis?.responses as Partial<AnamnesisFormData>)
    },
  });

  const watchFields = form.watch([
    "q1_alergia",
    "q2_medicamento",
    "q3_doenca",
    "q5_observacao",
  ]);

  const onSubmit = async (data: AnamnesisFormData) => {
    setIsSubmitting(true);
    try {
      await saveMutation.mutateAsync({
        clientId: id!,
        responses: data,
        dataNascimento: data.dataNascimento,
        consent: data.consentimento
      });

      toast({
        title: "Ficha salva com sucesso!",
        description: "A ficha de anamnese foi atualizada.",
      });

      navigate(`/cliente/${id}`);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a ficha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/cliente/${id}`);
  };

  // Agora sim, returns condicionais DEPOIS de todos os hooks
  if (isLoading) {
    return <LoadingSpinner message="Carregando ficha de anamnese..." />;
  }

  if (error || !client) {
    return <ErrorMessage message="Erro ao carregar dados do cliente" />;
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header fixo */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="hover:bg-primary-light"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-primary-dark">
                  Ficha de Anamnese
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {client.name}
                  </p>
                  {client.lastProcedureDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Último procedimento: {client.lastProcedureDate} às {client.lastProcedureTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Ficha"}
            </Button>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Data de Nascimento */}
            <Card className="shadow-card animate-fade-in">
              <CardHeader>
                <CardTitle className="text-primary-dark">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pergunta 1: Alergias */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-primary-dark">Alergias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="q1_alergia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Você possui alguma alergia? *</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="sim"
                              checked={field.value === "sim"}
                              onChange={() => field.onChange("sim")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="nao"
                              checked={field.value === "nao"}
                              onChange={() => field.onChange("nao")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Não</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[0] === "sim" && (
                  <FormField
                    control={form.control}
                    name="q1_alergia_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Se sim, quais?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva suas alergias..."
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Pergunta 2: Medicamentos */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-primary-dark">Medicamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="q2_medicamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Você faz uso de medicamentos contínuos? *</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="sim"
                              checked={field.value === "sim"}
                              onChange={() => field.onChange("sim")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="nao"
                              checked={field.value === "nao"}
                              onChange={() => field.onChange("nao")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Não</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[1] === "sim" && (
                  <FormField
                    control={form.control}
                    name="q2_medicamento_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Se sim, quais?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os medicamentos..."
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Pergunta 3: Doenças de Pele */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-primary-dark">Condições de Pele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="q3_doenca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Você possui alguma doença de pele ou condição especial? *
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="sim"
                              checked={field.value === "sim"}
                              onChange={() => field.onChange("sim")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="nao"
                              checked={field.value === "nao"}
                              onChange={() => field.onChange("nao")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Não</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[2] === "sim" && (
                  <FormField
                    control={form.control}
                    name="q3_doenca_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Se sim, quais?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva as condições..."
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Pergunta 4: Gravidez/Amamentação */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="text-primary-dark">Gravidez e Amamentação</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="q4_gravida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Você está grávida ou amamentando? *</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="sim"
                              checked={field.value === "sim"}
                              onChange={() => field.onChange("sim")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="nao"
                              checked={field.value === "nao"}
                              onChange={() => field.onChange("nao")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Não</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pergunta 5: Observações */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <CardTitle className="text-primary-dark">Observações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="q5_observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deseja adicionar alguma observação? *</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="sim"
                              checked={field.value === "sim"}
                              onChange={() => field.onChange("sim")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="nao"
                              checked={field.value === "nao"}
                              onChange={() => field.onChange("nao")}
                              className="w-4 h-4 accent-primary"
                            />
                            <span>Não</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[3] === "sim" && (
                  <FormField
                    control={form.control}
                    name="q5_observacao_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qual observação?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escreva sua observação..."
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Consentimento */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="consentimento"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-semibold">
                          Declaro que as informações prestadas são verdadeiras. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4 justify-end pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Salvar Ficha"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default ClientAnamnesisForm;
