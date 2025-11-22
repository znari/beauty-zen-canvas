import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentLoadingModalProps {
  isOpen: boolean;
}

export const PaymentLoadingModal = ({ isOpen }: PaymentLoadingModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Processando pagamento</DialogTitle>
          <DialogDescription className="text-center">
            Aguarde enquanto preparamos seu pagamento
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">
            Você será redirecionado para a página de pagamento em instantes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
