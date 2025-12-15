import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck, Calendar, Star } from "lucide-react";
import { PlanCard } from "@/components/PlanCard";

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
          <PlanCard
            variant="compact"
            id="monthly"
            name="Plano Mensal"
            subtitle="Flexibilidade total"
            icon={Calendar}
            features={[]}
            compactFeatures={[
              "Cancele quando quiser",
              "Sem fidelidade",
              "Renova todo mês"
            ]}
            priceMonthly={priceMonthly}
            billingPeriod="monthly"
            ctaText="Quero esse"
            ctaVariant="outline"
            onCtaClick={() => onSelectPeriod('monthly')}
            isProcessing={isProcessing && processingPeriod === 'monthly'}
            isDisabled={isProcessing && processingPeriod !== 'monthly'}
            animationDelay={100}
          />

          {/* Card Anual - Destacado */}
          <PlanCard
            variant="compact"
            id="yearly"
            name="Plano Anual"
            subtitle="Melhor custo-benefício"
            icon={Star}
            features={[]}
            compactFeatures={[
              "30% de desconto",
              "Acesso por 12 meses",
              "Preço garantido"
            ]}
            priceMonthly={priceMonthly}
            priceYearly={priceYearly}
            billingPeriod="yearly"
            highlighted={true}
            showSavings={true}
            showMonthlyEquivalent={true}
            badge="-30%"
            badgePosition="corner"
            badgeVariant="pulse"
            ctaText="Quero esse"
            ctaVariant="cta"
            onCtaClick={() => onSelectPeriod('yearly')}
            isProcessing={isProcessing && processingPeriod === 'yearly'}
            isDisabled={isProcessing && processingPeriod !== 'yearly'}
            animationDelay={200}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <ShieldCheck className="h-4 w-4" />
          Pagamento seguro via Stripe
        </div>
      </DialogContent>
    </Dialog>
  );
};
