import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Calendar, User, Sparkles, Heart, AlertCircle, FileText, Loader2 } from "lucide-react";
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
  skinConditions: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione uma opção",
  }),
  skinConditionDetails: z.string().optional(),
  additionalNotes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
});

type FormData = z.infer<typeof formSchema>;

const AnamnesisForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar dados reais da visita
  const { data: visitData, isLoading, error } = usePublicClientVisit(id || "");
  const saveMutation = usePublicSaveAnamnesis();

  // Redirecionar se a visita já passou
  if (visitData?.hasExpired) {
    navigate("/ficha/expirada");
    return null;
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: (visitData?.anamnesisResponses as FormData) || {
      isPregnantOrBreastfeeding: "no",
      useContinuousMedication: "no",
      hasAllergies: "no",
      previousProcedure: "no",
      skinConditions: "no",
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
        anamnesisId: visitData.anamnesisId
      });

      toast({
        title: "Ficha enviada com sucesso! 💜",
        description: "Obrigado por preencher sua ficha de anamnese.",
      });

      // Redirecionar para página de sucesso com dados da visita
      const formattedDate = visitData.visitDate ? formatLocalDate(visitData.visitDate, "dd/MM/yyyy") : "";
      const queryParams = new URLSearchParams({
        date: formattedDate,
        time: visitData.visitTime || "",
        professional: visitData.professionalName || ""
      });
      
      setTimeout(() => {
        navigate(`/ficha/sucesso?${queryParams.toString()}`);
      }, 1500);
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

  // Estados de loading e erro
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <LoadingSpinner message="Carregando suas informações..." />
      </div>
    );
  }

  if (error || !visitData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <ErrorMessage message="Não foi possível carregar os dados da visita. Verifique o link enviado." />
      </div>
    );
  }

  // Verificar se já foi preenchida
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
          <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">FichaZen</h1>
          </div>
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
          {/* Pergunta 1 */}
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
              <RadioGroup
                onValueChange={(value) => register("isPregnantOrBreastfeeding").onChange({ target: { value } })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pregnant-yes" {...register("isPregnantOrBreastfeeding")} />
                  <Label htmlFor="pregnant-yes" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pregnant-no" {...register("isPregnantOrBreastfeeding")} />
                  <Label htmlFor="pregnant-no" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {errors.isPregnantOrBreastfeeding && (
                <p className="text-sm text-destructive mt-2">{errors.isPregnantOrBreastfeeding.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 2 */}
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
              <RadioGroup
                onValueChange={(value) => register("useContinuousMedication").onChange({ target: { value } })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="medication-yes" {...register("useContinuousMedication")} />
                  <Label htmlFor="medication-yes" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="medication-no" {...register("useContinuousMedication")} />
                  <Label htmlFor="medication-no" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {errors.useContinuousMedication && (
                <p className="text-sm text-destructive">{errors.useContinuousMedication.message}</p>
              )}
              {watchFields.useContinuousMedication === "yes" && (
                <div className="animate-fade-in">
                  <Label htmlFor="medication-details">Quais medicamentos?</Label>
                  <Input
                    id="medication-details"
                    placeholder="Ex: Anticoncepcional, Roacutan, etc."
                    {...register("medicationDetails")}
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 3 */}
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
              <RadioGroup
                onValueChange={(value) => register("hasAllergies").onChange({ target: { value } })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="allergy-yes" {...register("hasAllergies")} />
                  <Label htmlFor="allergy-yes" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="allergy-no" {...register("hasAllergies")} />
                  <Label htmlFor="allergy-no" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {errors.hasAllergies && (
                <p className="text-sm text-destructive">{errors.hasAllergies.message}</p>
              )}
              {watchFields.hasAllergies === "yes" && (
                <div className="animate-fade-in">
                  <Label htmlFor="allergy-details">Quais alergias?</Label>
                  <Input
                    id="allergy-details"
                    placeholder="Ex: Látex, cosméticos específicos, etc."
                    {...register("allergyDetails")}
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 4 */}
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
            <CardContent>
              <RadioGroup
                onValueChange={(value) => register("previousProcedure").onChange({ target: { value } })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="previous-yes" {...register("previousProcedure")} />
                  <Label htmlFor="previous-yes" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="previous-no" {...register("previousProcedure")} />
                  <Label htmlFor="previous-no" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {errors.previousProcedure && (
                <p className="text-sm text-destructive mt-2">{errors.previousProcedure.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Pergunta 5 */}
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
              <RadioGroup
                onValueChange={(value) => register("skinConditions").onChange({ target: { value } })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="skin-yes" {...register("skinConditions")} />
                  <Label htmlFor="skin-yes" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="skin-no" {...register("skinConditions")} />
                  <Label htmlFor="skin-no" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
              {errors.skinConditions && (
                <p className="text-sm text-destructive">{errors.skinConditions.message}</p>
              )}
              {watchFields.skinConditions === "yes" && (
                <div className="animate-fade-in">
                  <Label htmlFor="skin-details">Descreva a condição:</Label>
                  <Textarea
                    id="skin-details"
                    placeholder="Descreva sua condição de pele..."
                    {...register("skinConditionDetails")}
                    className="mt-2 min-h-[80px]"
                  />
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
