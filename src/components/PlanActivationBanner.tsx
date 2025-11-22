import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { usePlanActivationDetector } from "@/hooks/usePlanActivationDetector";

export const PlanActivationBanner = () => {
  const { isWaitingActivation } = usePlanActivationDetector();

  if (!isWaitingActivation) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      <AlertTitle className="text-blue-900 font-semibold">
        Processando ativação do plano...
      </AlertTitle>
      <AlertDescription className="text-blue-800">
        Aguarde enquanto confirmamos seu pagamento. Isso pode levar alguns segundos.
      </AlertDescription>
    </Alert>
  );
};
