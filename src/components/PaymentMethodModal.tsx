import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode, Loader2 } from "lucide-react";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPix: () => void;
  onSelectCard: () => void;
  planName: string;
  planPrice: number;
  billingPeriod: 'monthly' | 'yearly';
  isProcessing: boolean;
  processingMethod: "pix" | "card" | null;
}

export const PaymentMethodModal = ({
  isOpen,
  onClose,
  onSelectPix,
  onSelectCard,
  planName,
  planPrice,
  billingPeriod,
  isProcessing,
  processingMethod,
}: PaymentMethodModalProps) => {
  const isYearly = billingPeriod === 'yearly';
  const periodLabel = isYearly ? '/ano' : '/mês';
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escolha a forma de pagamento</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{planName}</span>
            {isYearly && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Anual - 30% OFF
              </span>
            )}
            <br />
            <span className="text-lg font-bold text-foreground">
              R$ {planPrice.toFixed(2)}
            </span>
            <span className="text-muted-foreground">{periodLabel}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Opção PIX */}
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-4 flex items-start gap-4 justify-start hover:border-primary hover:bg-primary/5"
            onClick={onSelectPix}
            disabled={isProcessing}
          >
            {isProcessing && processingMethod === "pix" ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode className="h-6 w-6 text-emerald-600" />
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-foreground">PIX</p>
              <p className="text-sm text-muted-foreground">
                Pagamento instantâneo via QR Code
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Aprovação imediata
              </p>
            </div>
          </Button>

          {/* Opção Cartão */}
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-4 flex items-start gap-4 justify-start hover:border-primary hover:bg-primary/5"
            onClick={onSelectCard}
            disabled={isProcessing}
          >
            {isProcessing && processingMethod === "card" ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-foreground">Cartão de Crédito</p>
              <p className="text-sm text-muted-foreground">
                Pague com cartão via Mercado Pago
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Parcele em até 12x
              </p>
            </div>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Seus dados de pagamento são processados de forma segura
        </p>
      </DialogContent>
    </Dialog>
  );
};
