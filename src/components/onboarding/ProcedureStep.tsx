import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scissors, Plus, Trash2, Check } from "lucide-react";
import { useProcedures } from "@/hooks/useProcedures";
import { useCreateProcedure } from "@/hooks/useCreateProcedure";
import { useDeleteProcedure } from "@/hooks/useDeleteProcedure";
import { toast } from "sonner";

interface ProcedureStepProps {
  onValidChange: (isValid: boolean) => void;
}

export function ProcedureStep({ onValidChange }: ProcedureStepProps) {
  const { data: procedures = [] } = useProcedures();
  const createProcedure = useCreateProcedure();
  const deleteProcedure = useDeleteProcedure();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    // Valid if at least one procedure exists
    onValidChange(procedures.length > 0);
  }, [procedures, onValidChange]);

  const handleAdd = async () => {
    if (!name.trim() || !price) {
      toast.error("Preencha nome e preço do procedimento");
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error("Preço inválido");
      return;
    }

    try {
      await createProcedure.mutateAsync({
        name: name.trim(),
        price: priceNumber,
      });
      toast.success(`${name} adicionado!`);
      setName("");
      setPrice("");
    } catch (error) {
      toast.error("Erro ao adicionar procedimento");
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    try {
      await deleteProcedure.mutateAsync(id);
      toast.success(`${nome} removido`);
    } catch (error) {
      toast.error("Erro ao remover procedimento");
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Quais serviços você oferece? Cadastre pelo menos um procedimento para continuar.
      </p>

      {/* Form to add new procedure */}
      <Card className="p-4 bg-primary-light/30 border-primary/20">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proc-name">Nome do Procedimento *</Label>
              <Input
                id="proc-name"
                placeholder="Ex: Design de Sobrancelhas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createProcedure.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proc-price">Preço (R$) *</Label>
              <Input
                id="proc-price"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={createProcedure.isPending}
              />
            </div>
          </div>

          <Button
            onClick={handleAdd}
            disabled={createProcedure.isPending}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createProcedure.isPending ? "Adicionando..." : "Adicionar Procedimento"}
          </Button>
        </div>
      </Card>

      {/* List of added procedures */}
      {procedures.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-dark">
            <Check className="h-4 w-4 text-green-600" />
            Procedimentos cadastrados ({procedures.length}):
          </div>
          <div className="space-y-2">
            {procedures.map((proc) => (
              <Card key={proc.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scissors className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{proc.nome}</p>
                    <p className="text-xs text-success-foreground font-semibold">
                      R$ {proc.preco.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(proc.id, proc.nome)}
                  disabled={deleteProcedure.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {procedures.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Scissors className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum procedimento cadastrado ainda</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Você pode gerenciar procedimentos depois em{" "}
          <strong>Configurações → Procedimentos</strong>
        </p>
      </div>
    </div>
  );
}
