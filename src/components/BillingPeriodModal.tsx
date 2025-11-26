import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Loader2, ShieldCheck } from "lucide-react";

interface BillingPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPeriod: (period: 'monthly' | 'yearly') => void;
  planName: string;
  priceMonthly: number;
  priceYearly: number;
  isProcessing: boolean;
  processingPeriod: 'monthly' | 'yearly' | null;
}

export const BillingPeriodModal = ({
  isOpen,
  onClose,
  onSelectPeriod,
  planName,
  priceMonthly,
  priceYearly,
  isProcessing,
  processingPeriod,
}: BillingPeriodModalProps) => {
  // Calcular economia anual
  const fullYearlyPrice = priceMonthly * 12;
  const yearlySavings = fullYearlyPrice - priceYearly;
  const monthlyEquivalent = priceYearly / 12;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-center">
          <DialogTitle>Escolha o período de assinatura</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground text-lg">{planName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Card Mensal */}
          <div className="relative border-2 border-primary/40 rounded-xl p-5 hover:border-primary/70 transition-all duration-300 flex flex-col animate-fade-in [animation-delay:100ms]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Plano Mensal</h3>
                <p className="text-xs text-muted-foreground">Flexibilidade total</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold">
                R$ {priceMonthly.toFixed(2)}
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Cancele quando quiser
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Sem fidelidade
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Renova todo mês
              </li>
            </ul>

            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={() => onSelectPeriod('monthly')}
              disabled={isProcessing}
            >
              {isProcessing && processingPeriod === 'monthly' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Quero esse'
              )}
            </Button>
          </div>

          {/* Card Anual - Destacado */}
          <div className="relative border-2 border-primary rounded-xl p-5 bg-primary/5 flex flex-col animate-fade-in [animation-delay:200ms]">
            <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 animate-pulse">
              -30%
            </Badge>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Plano Anual</h3>
                <p className="text-xs text-muted-foreground">Melhor custo-benefício</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-sm text-muted-foreground line-through">
                R$ {fullYearlyPrice.toFixed(2)}
              </div>
              <div className="text-3xl font-bold text-primary">
                R$ {priceYearly.toFixed(2)}
                <span className="text-base font-normal text-muted-foreground">/ano</span>
              </div>
              <div className="text-sm text-muted-foreground">
                = R$ {monthlyEquivalent.toFixed(2)}/mês
              </div>
            </div>

            <Badge className="bg-green-500 hover:bg-green-500 text-white mb-4">
              Economize R$ {yearlySavings.toFixed(2)}/ano
            </Badge>

            <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 30% de desconto
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Acesso por 12 meses
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Preço garantido
              </li>
            </ul>

            <Button
              variant="cta"
              className="w-full mt-6"
              onClick={() => onSelectPeriod('yearly')}
              disabled={isProcessing}
            >
              {isProcessing && processingPeriod === 'yearly' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Quero esse'
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <ShieldCheck className="h-4 w-4" />
          Pagamento seguro via Mercado Pago
        </div>
      </DialogContent>
    </Dialog>
  );
};
