import { useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Calendar, User, Sparkles, Heart, AlertCircle, FileText, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { usePublicClientVisit } from "@/hooks/usePublicClientVisit";
import { usePublicSaveAnamnesis } from "@/hooks/usePublicSaveAnamnesis";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { formatLocalDate } from "@/lib/dateUtils";

const formSchema = z.object({
  isPregnantOrBreastfeeding: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione uma opção",
  }),
  useContinuousMedication: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione uma opção",
  }),
  medicationDetails: z.string().optional(),
  hasAllergies: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione uma opção",
  }),
  allergyDetails: z.string().optional(),
  previousProcedure: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione uma opção",
  }),
  previousProcedureDetails: z.string().optional(),
  skinConditions: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione uma opção",
  }),
  skinConditionDetails: z.string().optional(),
  additionalNotes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
  consentTerms: z.boolean().refine(val => val === true, {
    message: "Você precisa concordar com os termos para enviar a ficha"
  }),
}).superRefine((data, ctx) => {
  if (data.useContinuousMedication === "yes" && (!data.medicationDetails || data.medicationDetails.length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, informe quais medicamentos (mínimo 5 caracteres)",
      path: ["medicationDetails"],
    });
  }
  if (data.hasAllergies === "yes" && (!data.allergyDetails || data.allergyDetails.length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, informe quais alergias (mínimo 5 caracteres)",
      path: ["allergyDetails"],
    });
  }
  if (data.previousProcedure === "yes" && (!data.previousProcedureDetails || data.previousProcedureDetails.length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, informe detalhes do procedimento anterior (mínimo 5 caracteres)",
      path: ["previousProcedureDetails"],
    });
  }
  if (data.skinConditions === "yes" && (!data.skinConditionDetails || data.skinConditionDetails.length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, descreva a condição de pele (mínimo 5 caracteres)",
      path: ["skinConditionDetails"],
    });
  }
});

type FormData = z.infer<typeof formSchema>;

// Success Screen Component
const SuccessScreen = ({ visitDate, visitTime, professionalName, studioName }: {
  visitDate: string;
  visitTime: string;
  professionalName: string;
  studioName?: string;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
    <Card className="max-w-md w-full text-center shadow-lg border-primary/20 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <CardTitle className="text-2xl text-foreground">Ficha Enviada com Sucesso!</CardTitle>
        <CardDescription className="text-base">
          Obrigado por preencher sua ficha de anamnese. Estamos ansiosos para te atender!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Seu agendamento</p>
          <p className="text-lg font-semibold text-foreground">
            {visitDate} às {visitTime}
          </p>
          <p className="text-sm text-muted-foreground">
            com <span className="text-primary font-medium">{professionalName}</span>
          </p>
          {studioName && (
            <p className="text-xs text-muted-foreground mt-2">{studioName}</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          💜 Você já pode fechar esta página
        </p>
      </CardContent>
    </Card>
  </div>
);

const AnamnesisForm = () => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState({ date: "", time: "", professional: "", studio: "" });

  const { data: visitData, isLoading, error } = usePublicClientVisit(id || "");
  const saveMutation = usePublicSaveAnamnesis();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPregnantOrBreastfeeding: (visitData?.anamnesisResponses as FormData)?.isPregnantOrBreastfeeding || "no",
      useContinuousMedication: (visitData?.anamnesisResponses as FormData)?.useContinuousMedication || "no",
      hasAllergies: (visitData?.anamnesisResponses as FormData)?.hasAllergies || "no",
      previousProcedure: (visitData?.anamnesisResponses as FormData)?.previousProcedure || "no",
      skinConditions: (visitData?.anamnesisResponses as FormData)?.skinConditions || "no",
      medicationDetails: (visitData?.anamnesisResponses as FormData)?.medicationDetails || "",
      allergyDetails: (visitData?.anamnesisResponses as FormData)?.allergyDetails || "",
      previousProcedureDetails: (visitData?.anamnesisResponses as FormData)?.previousProcedureDetails || "",
      skinConditionDetails: (visitData?.anamnesisResponses as FormData)?.skinConditionDetails || "",
      additionalNotes: (visitData?.anamnesisResponses as FormData)?.additionalNotes || "",
      consentTerms: false,
    }
  });

  const watchFields = {
    useContinuousMedication: watch("useContinuousMedication"),
    hasAllergies: watch("hasAllergies"),
    skinConditions: watch("skinConditions"),
    isPregnantOrBreastfeeding: watch("isPregnantOrBreastfeeding"),
    previousProcedure: watch("previousProcedure"),
  };

  const onSubmit = async (data: FormData) => {
    if (!visitData) return;
    
    setIsSubmitting(true);
    
    try {
      await saveMutation.mutateAsync({
        clientId: visitData.clientId,
        responses: data,
      });

      toast({
        title: "Ficha enviada com sucesso! 💜",
        description: "Obrigado por preencher sua ficha de anamnese.",
      });

      // Set success state and data
      const formattedDate = visitData.visitDate ? formatLocalDate(visitData.visitDate, "dd/MM/yyyy") : "";
      setSubmittedData({
        date: formattedDate,
        time: visitData.visitTime || "",
        professional: visitData.professionalName || "",
        studio: visitData.studioName || ""
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erro ao enviar ficha:", error);
      toast({
        title: "Erro ao enviar ficha",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success screen if submitted
  if (isSubmitted) {
    return (
      <SuccessScreen
        visitDate={submittedData.date}
        visitTime={submittedData.time}
        professionalName={submittedData.professional}
        studioName={submittedData.studio}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <LoadingSpinner message="Carregando suas informações..." />
      </div>
    );
  }

  // Error state
  if (error || !visitData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <ErrorMessage message="Não foi possível carregar os dados da visita. Verifique o link enviado." />
      </div>
    );
  }

  // Redirect if expired
  if (visitData.hasExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Link Expirado</CardTitle>
            <CardDescription>
              Este link já passou da data do procedimento e não pode mais ser utilizado.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Already filled
  if (visitData.isAlreadyFilled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-success" />
            </div>
            <CardTitle>Ficha já preenchida!</CardTitle>
            <CardDescription>
              Esta ficha foi preenchida em {formatLocalDate(visitData.anamnesisFilledAt!, "dd/MM/yyyy 'às' HH:mm")}.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-soft">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3 mb-3 animate-fade-in">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">FichaZen</h1>
          </div>
          {visitData.studioName && (
            <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
              <p className="text-lg font-medium text-foreground">
                {visitData.studioName}
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
          )}
          <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-2xl font-semibold text-foreground">
              Ficha de Anamnese — {visitData.clientName}
            </h2>
            <p className="text-muted-foreground">
              Data do procedimento: <span className="font-medium text-foreground">{formatLocalDate(visitData.visitDate, "dd/MM/yyyy")} às {visitData.visitTime}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Procedimento: <span className="text-primary font-medium">{visitData.procedureName}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 pb-16">
        {/* Informações Iniciais */}
        <Card className="mb-8 animate-fade-in border-primary/20" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Informações do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{visitData.clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">{formatLocalDate(visitData.visitDate, "dd/MM/yyyy")} às {visitData.visitTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Procedimento</p>
                <p className="font-medium">{visitData.procedureName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profissional</p>
                <p className="font-medium">{visitData.professionalName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Pergunta 1 - Gravidez */}
          <Card 
            className={`animate-fade-in border-primary/20 transition-all duration-300 ${
              watchFields.isPregnantOrBreastfeeding === "yes" ? "bg-primary/5 border-primary/40" : ""
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Está grávida ou amamentando?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="isPregnantOrBreastfeeding"
                render={({ field }) => (
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
                )}
              />
              {errors.isPregnantOrBreastfeeding && (
                <p className="text-sm text-destructive mt-2">{errors.isPregnantOrBreastfeeding.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 2 - Medicamentos */}
          <Card 
            className={`animate-fade-in border-primary/20 transition-all duration-300 ${
              watchFields.useContinuousMedication === "yes" ? "bg-primary/5 border-primary/40" : ""
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Faz uso de algum medicamento contínuo?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="useContinuousMedication"
                render={({ field }) => (
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
                )}
              />
              {errors.useContinuousMedication && (
                <p className="text-sm text-destructive">{errors.useContinuousMedication.message}</p>
              )}
              {watchFields.useContinuousMedication === "yes" && (
                <div className="animate-fade-in">
                  <Label htmlFor="medication-details">Quais medicamentos? *</Label>
                  <Input
                    id="medication-details"
                    placeholder="Ex: Anticoncepcional, Roacutan, etc."
                    {...register("medicationDetails")}
                    className="mt-2"
                  />
                  {errors.medicationDetails && (
                    <p className="text-sm text-destructive mt-1">{errors.medicationDetails.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 3 - Alergias */}
          <Card 
            className={`animate-fade-in border-primary/20 transition-all duration-300 ${
              watchFields.hasAllergies === "yes" ? "bg-primary/5 border-primary/40" : ""
            }`}
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Possui alguma alergia conhecida?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="hasAllergies"
                render={({ field }) => (
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
                )}
              />
              {errors.hasAllergies && (
                <p className="text-sm text-destructive">{errors.hasAllergies.message}</p>
              )}
              {watchFields.hasAllergies === "yes" && (
                <div className="animate-fade-in">
                  <Label htmlFor="allergy-details">Quais alergias? *</Label>
                  <Input
                    id="allergy-details"
                    placeholder="Ex: Látex, cosméticos específicos, etc."
                    {...register("allergyDetails")}
                    className="mt-2"
                  />
                  {errors.allergyDetails && (
                    <p className="text-sm text-destructive mt-1">{errors.allergyDetails.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 4 - Procedimento Anterior */}
          <Card 
            className={`animate-fade-in border-primary/20 transition-all duration-300 ${
              watchFields.previousProcedure === "yes" ? "bg-primary/5 border-primary/40" : ""
            }`}
            style={{ animationDelay: "0.6s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Já realizou este procedimento antes?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="previousProcedure"
                render={({ field }) => (
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
                )}
              />
              {errors.previousProcedure && (
                <p className="text-sm text-destructive">{errors.previousProcedure.message}</p>
              )}
              {watchFields.previousProcedure === "yes" && (
                <div className="animate-fade-in">
                  <Label htmlFor="previous-details">Há quanto tempo? Onde realizou? *</Label>
                  <Input
                    id="previous-details"
                    placeholder="Ex: Há 6 meses, no Studio X"
                    {...register("previousProcedureDetails")}
                    className="mt-2"
                  />
                  {errors.previousProcedureDetails && (
                    <p className="text-sm text-destructive mt-1">{errors.previousProcedureDetails.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 5 - Condição de Pele */}
          <Card 
            className={`animate-fade-in border-primary/20 transition-all duration-300 ${
              watchFields.skinConditions === "yes" ? "bg-primary/5 border-primary/40" : ""
            }`}
            style={{ animationDelay: "0.7s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Possui alguma condição de pele relevante?
              </CardTitle>
              <CardDescription>
                Ex: Acne ativa, rosácea, dermatite, cicatrizes queloides, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="skinConditions"
                render={({ field }) => (
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
                )}
              />
              {errors.skinConditions && (
                <p className="text-sm text-destructive">{errors.skinConditions.message}</p>
              )}
              {watchFields.skinConditions === "yes" && (
                <div className="animate-fade-in">
                  <Label htmlFor="skin-details">Descreva a condição: *</Label>
                  <Textarea
                    id="skin-details"
                    placeholder="Descreva sua condição de pele..."
                    {...register("skinConditionDetails")}
                    className="mt-2 min-h-[80px]"
                  />
                  {errors.skinConditionDetails && (
                    <p className="text-sm text-destructive mt-1">{errors.skinConditionDetails.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 6 - Observações */}
          <Card className="animate-fade-in border-primary/20" style={{ animationDelay: "0.8s" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Observações Adicionais
              </CardTitle>
              <CardDescription>
                Há algo mais que gostaria de compartilhar? (Opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ex: Preferências, preocupações, expectativas..."
                {...register("additionalNotes")}
                className="min-h-[120px]"
              />
              {errors.additionalNotes && (
                <p className="text-sm text-destructive mt-2">{errors.additionalNotes.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Máximo de 500 caracteres
              </p>
            </CardContent>
          </Card>

          {/* Termos de Consentimento */}
          <Card className="animate-fade-in border-primary/20 bg-primary/5" style={{ animationDelay: "0.85s" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Termo de Consentimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Ao enviar esta ficha, você declara que:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>As informações fornecidas são verdadeiras e completas</li>
                  <li>Autoriza o uso dos dados para fins de avaliação e realização do procedimento</li>
                  <li>Compreende que a omissão de informações pode comprometer sua segurança</li>
                </ul>
              </div>
              <div className="flex items-start space-x-3 pt-2">
                <Controller
                  control={control}
                  name="consentTerms"
                  render={({ field }) => (
                    <Checkbox
                      id="consent-terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  )}
                />
                <Label htmlFor="consent-terms" className="cursor-pointer text-sm leading-relaxed">
                  Li e concordo com os termos acima. Confirmo que todas as informações são verdadeiras.
                </Label>
              </div>
              {errors.consentTerms && (
                <p className="text-sm text-destructive">{errors.consentTerms.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Botão de Envio */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.9s" }}>
            <Button
              type="submit"
              size="xl"
              className="gradient-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando ficha...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Enviar Ficha
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-8 mt-16">
        <div className="container max-w-4xl mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 FichaZen — Suas fichas de anamnese mais organizadas, seguras e zen ✨
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AnamnesisForm;
