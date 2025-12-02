import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, ChevronRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";

interface ClientStepProps {
  onValidChange: (isValid: boolean) => void;
}

export function ClientStep({ onValidChange }: ClientStepProps) {
  const navigate = useNavigate();
  const { data: clients = [] } = useClients();
  const hasClients = clients.length > 0;

  useEffect(() => {
    // This step is always optional, so always valid
    onValidChange(true);
  }, [onValidChange]);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        {hasClients
          ? "Você já tem clientes cadastrados! Pode pular esta etapa ou adicionar mais."
          : "Adicione seu primeiro cliente para começar a usar o sistema (opcional)."}
      </p>

      {hasClients ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <p className="font-medium text-green-900 mb-1">
            ✅ Você já tem {clients.length} cliente(s) cadastrado(s)!
          </p>
          <p className="text-sm text-green-700">Pode continuar para a próxima etapa</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-primary-light/30 border border-primary/20 rounded-lg p-6 text-center">
            <UserPlus className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="font-medium text-primary-dark mb-2">Cadastre seu primeiro cliente</p>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione informações do cliente e agende sua primeira visita
            </p>
            <Button
              variant="cta"
              onClick={() => {
                // Navigate to new client page, they'll come back after
                navigate("/cliente/novo");
              }}
            >
              Cadastrar Cliente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900 text-center">
              💡 <strong>Esta etapa é opcional.</strong> Você pode adicionar clientes depois
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          📱 <strong>Lembrete:</strong> Ao cadastrar clientes, você poderá enviar fichas de
          anamnese via WhatsApp e gerenciar agendamentos facilmente
        </p>
      </div>
    </div>
  );
}
