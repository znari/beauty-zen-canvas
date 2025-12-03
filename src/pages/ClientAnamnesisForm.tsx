import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Save, Calendar, User, FileDown, CheckCircle, XCircle } from "lucide-react";
import { useClientAnamnesis } from "@/hooks/useClientAnamnesis";
import { useSaveAnamnesis } from "@/hooks/useSaveAnamnesis";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { exportAnamnesisToPDF } from "@/lib/exportAnamnesisPDF";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Schema unificado que aceita tanto formato novo quanto legacy
const anamnesisSchema = z.object({
  dataNascimento: z.string().optional(),
  isPregnantOrBreastfeeding: z.enum(["yes", "no"]),
  useContinuousMedication: z.enum(["yes", "no"]),
  medicationDetails: z.string().optional(),
  hasAllergies: z.enum(["yes", "no"]),
  allergyDetails: z.string().optional(),
  previousProcedure: z.enum(["yes", "no"]),
  previousProcedureDetails: z.string().optional(),
  skinConditions: z.enum(["yes", "no"]),
  skinConditionDetails: z.string().optional(),
  additionalNotes: z.string().optional(),
  consentTerms: z.boolean(),
});

type AnamnesisFormData = z.infer<typeof anamnesisSchema>;

// Helper para converter formato legacy para novo
const convertLegacyToNew = (responses: any): Partial<AnamnesisFormData> => {
  if (!responses) return {};
  
  // Se já está no formato novo, retorna direto
  if (responses.isPregnantOrBreastfeeding || responses.hasAllergies) {
    return responses;
  }
  
  // Converte formato legacy
  return {
    isPregnantOrBreastfeeding: responses.q4_gravida === "sim" ? "yes" : "no",
    useContinuousMedication: responses.q2_medicamento === "sim" ? "yes" : "no",
    medicationDetails: responses.q2_medicamento_details || "",
    hasAllergies: responses.q1_alergia === "sim" ? "yes" : "no",
    allergyDetails: responses.q1_alergia_details || "",
    previousProcedure: "no",
    previousProcedureDetails: "",
    skinConditions: responses.q3_doenca === "sim" ? "yes" : "no",
    skinConditionDetails: responses.q3_doenca_details || "",
    additionalNotes: responses.q5_observacao_details || "",
    consentTerms: responses.consentimento || false,
  };
};

const ClientAnamnesisForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch studio name from profile
  const { data: profileData } = useQuery({
    queryKey: ["profile-studio", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("studio_name")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: client, isLoading, error } = useClientAnamnesis(id!);
  const saveMutation = useSaveAnamnesis();

  // Converter dados existentes
  const existingData = client?.anamnesis?.responses 
    ? convertLegacyToNew(client.anamnesis.responses)
    : {};

  const form = useForm<AnamnesisFormData>({
    resolver: zodResolver(anamnesisSchema),
    defaultValues: {
      dataNascimento: "",
      isPregnantOrBreastfeeding: "no",
      useContinuousMedication: "no",
      medicationDetails: "",
      hasAllergies: "no",
      allergyDetails: "",
      previousProcedure: "no",
      previousProcedureDetails: "",
      skinConditions: "no",
      skinConditionDetails: "",
      additionalNotes: "",
      consentTerms: false,
    },
  });

  // Atualizar form quando dados carregarem
  useEffect(() => {
    if (client) {
      const convertedData = client.anamnesis?.responses 
        ? convertLegacyToNew(client.anamnesis.responses)
        : {};
      
      form.reset({
        dataNascimento: client.dateOfBirth || "",
        isPregnantOrBreastfeeding: convertedData.isPregnantOrBreastfeeding || "no",
        useContinuousMedication: convertedData.useContinuousMedication || "no",
        medicationDetails: convertedData.medicationDetails || "",
        hasAllergies: convertedData.hasAllergies || "no",
        allergyDetails: convertedData.allergyDetails || "",
        previousProcedure: convertedData.previousProcedure || "no",
        previousProcedureDetails: convertedData.previousProcedureDetails || "",
        skinConditions: convertedData.skinConditions || "no",
        skinConditionDetails: convertedData.skinConditionDetails || "",
        additionalNotes: convertedData.additionalNotes || "",
        consentTerms: client.anamnesis?.consent || convertedData.consentTerms || false,
      });
    }
  }, [client, form]);

  const watchFields = form.watch([
    "hasAllergies",
    "useContinuousMedication",
    "skinConditions",
    "previousProcedure",
  ]);

  const onSubmit = async (data: AnamnesisFormData) => {
    setIsSubmitting(true);
    try {
      await saveMutation.mutateAsync({
        clientId: id!,
        responses: data,
        dataNascimento: data.dataNascimento,
        consent: data.consentTerms
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

  const handleExportPDF = () => {
    if (!client) return;

    const formValues = form.getValues();
    
    exportAnamnesisToPDF({
      clientName: client.name,
      dateOfBirth: formValues.dataNascimento || client.dateOfBirth,
      filledAt: client.anamnesis?.filled_at,
      responses: formValues,
    }, profileData?.studio_name || undefined);
    
    toast({
      title: "PDF exportado!",
      description: "A ficha foi baixada com sucesso.",
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando ficha de anamnese..." />;
  }

  if (error || !client) {
    return <ErrorMessage message="Erro ao carregar dados do cliente" />;
  }

  // Helper para renderizar ícone de resposta
  const ResponseIcon = ({ value }: { value: string }) => {
    if (value === "yes") {
      return <CheckCircle className="h-4 w-4 text-success inline mr-1" />;
    }
    return <XCircle className="h-4 w-4 text-muted-foreground inline mr-1" />;
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header fixo */}
      <header className="bg-background/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="hover:bg-primary/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="hidden sm:flex"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
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
                <CardTitle className="text-foreground">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pergunta: Gravidez/Amamentação */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-foreground">Gravidez e Amamentação</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="isPregnantOrBreastfeeding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Está grávida ou amamentando?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="pregnant-yes" />
                            <Label htmlFor="pregnant-yes" className="cursor-pointer">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="pregnant-no" />
                            <Label htmlFor="pregnant-no" className="cursor-pointer">Não</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pergunta: Alergias */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-foreground">Alergias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasAllergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possui alguma alergia?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="allergy-yes" />
                            <Label htmlFor="allergy-yes" className="cursor-pointer">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="allergy-no" />
                            <Label htmlFor="allergy-no" className="cursor-pointer">Não</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[0] === "yes" && (
                  <FormField
                    control={form.control}
                    name="allergyDetails"
                    render={({ field }) => (
                      <FormItem className="animate-fade-in">
                        <FormLabel>Quais alergias?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva suas alergias..."
                            {...field}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Pergunta: Medicamentos */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-foreground">Medicamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="useContinuousMedication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faz uso de medicamentos contínuos?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="medication-yes" />
                            <Label htmlFor="medication-yes" className="cursor-pointer">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="medication-no" />
                            <Label htmlFor="medication-no" className="cursor-pointer">Não</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[1] === "yes" && (
                  <FormField
                    control={form.control}
                    name="medicationDetails"
                    render={({ field }) => (
                      <FormItem className="animate-fade-in">
                        <FormLabel>Quais medicamentos?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os medicamentos..."
                            {...field}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Pergunta: Condições de Pele */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="text-foreground">Condições de Pele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="skinConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possui alguma condição de pele?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="skin-yes" />
                            <Label htmlFor="skin-yes" className="cursor-pointer">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="skin-no" />
                            <Label htmlFor="skin-no" className="cursor-pointer">Não</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[2] === "yes" && (
                  <FormField
                    control={form.control}
                    name="skinConditionDetails"
                    render={({ field }) => (
                      <FormItem className="animate-fade-in">
                        <FormLabel>Descreva a condição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva as condições de pele..."
                            {...field}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Pergunta: Procedimento Anterior */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <CardTitle className="text-foreground">Procedimento Anterior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="previousProcedure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Já realizou este procedimento antes?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="previous-yes" />
                            <Label htmlFor="previous-yes" className="cursor-pointer">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="previous-no" />
                            <Label htmlFor="previous-no" className="cursor-pointer">Não</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchFields[3] === "yes" && (
                  <FormField
                    control={form.control}
                    name="previousProcedureDetails"
                    render={({ field }) => (
                      <FormItem className="animate-fade-in">
                        <FormLabel>Há quanto tempo? Onde?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Há 6 meses, no Studio X"
                            {...field}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Observações Adicionais */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <CardHeader>
                <CardTitle className="text-foreground">Observações Adicionais</CardTitle>
                <CardDescription>Informações extras que o cliente informou</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais..."
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Consentimento */}
            <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="consentTerms"
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
                          Cliente declarou que as informações são verdadeiras
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4 justify-between pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportPDF}
                className="sm:hidden"
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <div className="flex gap-4 ml-auto">
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
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default ClientAnamnesisForm;
