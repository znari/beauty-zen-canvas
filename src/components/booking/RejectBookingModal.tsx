import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RejectBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

const PRESET_REASONS = [
  { id: "unavailable", label: "Horário indisponível" },
  { id: "full", label: "Agenda cheia nesta data" },
  { id: "other", label: "Outro motivo" },
];

export function RejectBookingModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: RejectBookingModalProps) {
  const [selectedReason, setSelectedReason] = useState("unavailable");
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = () => {
    let reason = "";
    if (selectedReason === "other") {
      reason = customReason.trim() || "Motivo não especificado";
    } else {
      reason = PRESET_REASONS.find((r) => r.id === selectedReason)?.label || "";
    }
    onConfirm(reason);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedReason("unavailable");
      setCustomReason("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeitar Solicitação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Motivo da rejeição</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {PRESET_REASONS.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id} className="font-normal cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Especifique o motivo</Label>
              <Textarea
                id="custom-reason"
                placeholder="Digite o motivo da rejeição..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Rejeitando..." : "Confirmar Rejeição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
