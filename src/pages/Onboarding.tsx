import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { confettiFireworks } from "@/lib/confetti";
import { toast } from "sonner";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { ProfileStep } from "@/components/onboarding/ProfileStep";
import { ProcedureStep } from "@/components/onboarding/ProcedureStep";
import { ClientStep } from "@/components/onboarding/ClientStep";
import { MessagesStep } from "@/components/onboarding/MessagesStep";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const { markOnboardingComplete, markOnboardingSkipped } = useOnboardingStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      setCanProceed(false); // Reset for next step
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    await markOnboardingComplete();
    confettiFireworks();
    toast.success("🎉 Parabéns! Seu FichaZen está pronto para uso!");
    navigate("/dashboard");
  };

  const handleSkip = async () => {
    await markOnboardingSkipped();
    toast.info("Você pode completar a configuração depois em Configurações");
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onContinue={() => setCanProceed(true)} />;
      case 2:
        return <ProfileStep onValidChange={setCanProceed} />;
      case 3:
        return <ProcedureStep onValidChange={setCanProceed} />;
      case 4:
        return <ClientStep onValidChange={setCanProceed} />;
      case 5:
        return <MessagesStep onValidChange={setCanProceed} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Bem-vindo ao FichaZen!";
      case 2: return "Configure seu Estúdio";
      case 3: return "Cadastre seus Procedimentos";
      case 4: return "Adicione seu Primeiro Cliente";
      case 5: return "Personalize suas Mensagens";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">FichaZen</h1>
              <div className="hidden sm:block text-sm text-muted-foreground">
                Configuração Inicial
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSkipDialog(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Pular Onboarding
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Bar */}
        <Card className="p-6 mb-6 shadow-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-primary">
                Etapa {currentStep} de {TOTAL_STEPS}
              </span>
              <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    index + 1 <= currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-6 md:p-8 shadow-card mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2">
            {getStepTitle()}
          </h2>
          <div className="mt-6">{renderStep()}</div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="min-w-[120px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Button
            variant="cta"
            onClick={handleNext}
            disabled={!canProceed && currentStep !== 1}
            className="min-w-[120px]"
          >
            {currentStep === TOTAL_STEPS ? (
              "Concluir"
            ) : (
              <>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Você pode completar isso depois em <strong>Configurações</strong>
          </p>
        </div>
      </main>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pular Configuração Inicial?</AlertDialogTitle>
            <AlertDialogDescription>
              Você pode pular o onboarding e configurar tudo depois nas configurações. No entanto,
              recomendamos completar a configuração agora para aproveitar melhor o FichaZen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Configurando</AlertDialogCancel>
            <AlertDialogAction onClick={handleSkip}>Pular</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
