import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Scissors, Lock } from "lucide-react";
import { useProcedures } from "@/hooks/useProcedures";
import { useCreateProcedure } from "@/hooks/useCreateProcedure";
import { useUpdateProcedure } from "@/hooks/useUpdateProcedure";
import { useDeleteProcedure } from "@/hooks/useDeleteProcedure";
import { useBlockedActions } from "@/hooks/useBlockedActions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

const procedureSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  preco: z.coerce.number().min(0, "Preço deve ser maior que zero"),
});

type ProcedureData = z.infer<typeof procedureSchema>;

export default function ProcedureManagement() {
  const navigate = useNavigate();
  const { data: procedimentos = [], isLoading, error } = useProcedures();
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();
  const deleteProcedure = useDeleteProcedure();
  const { checkPermission, isBlocked } = useBlockedActions();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProcedimento, setSelectedProcedimento] = useState<any>(null);

  const form = useForm<ProcedureData>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      nome: "",
      preco: 0,
    },
  });

  const handleAdd = async (data: ProcedureData) => {
    if (!checkPermission('create')) return;
    try {
      await createProcedure.mutateAsync({
        name: data.nome,
        price: data.preco,
      });
      toast({
        title: "Procedimento adicionado",
        description: `${data.nome} foi adicionado com sucesso.`,
      });
      setAddDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar procedimento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data: ProcedureData) => {
    if (!checkPermission('edit')) return;
    try {
      await updateProcedure.mutateAsync({
        id: selectedProcedimento.id,
        name: data.nome,
        price: data.preco,
      });
      toast({
        title: "Procedimento atualizado",
        description: `${data.nome} foi atualizado com sucesso.`,
      });
      setEditDialogOpen(false);
      setSelectedProcedimento(null);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar procedimento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!checkPermission('delete')) return;
    try {
      await deleteProcedure.mutateAsync(selectedProcedimento.id);
      toast({
        title: "Procedimento removido",
        description: `${selectedProcedimento.nome} foi removido.`,
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setSelectedProcedimento(null);
    } catch (error: any) {
      toast({
        title: "Erro ao remover procedimento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (procedimento: any) => {
    setSelectedProcedimento(procedimento);
    form.setValue("nome", procedimento.nome);
    form.setValue("preco", Number(procedimento.preco));
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (procedimento: any) => {
    setSelectedProcedimento(procedimento);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary-light">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-primary-light"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-primary-dark">Gerenciar Procedimentos</h1>
                <p className="text-sm text-muted-foreground">Adicione, edite ou remova serviços oferecidos</p>
              </div>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} variant="cta" disabled={isBlocked}>
              {isBlocked ? <Lock className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
              {isBlocked ? "Bloqueado" : "Novo Procedimento"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-dark">
              <Scissors className="h-5 w-5" />
              Procedimentos Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner message="Carregando procedimentos..." />
            ) : error ? (
              <ErrorMessage message={error.message} />
            ) : procedimentos.length === 0 ? (
              <div className="text-center py-12">
                <Scissors className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground font-medium mb-2">Nenhum procedimento cadastrado</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Comece adicionando seus serviços para cadastrar clientes
                </p>
                <Button onClick={() => setAddDialogOpen(true)} variant="cta">
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Primeiro Procedimento
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-accent/30 hover:bg-accent/30">
                      <TableHead className="font-bold text-secondary">Procedimento</TableHead>
                      <TableHead className="font-bold text-secondary">Preço</TableHead>
                      <TableHead className="font-bold text-secondary text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedimentos.map((procedimento, idx) => (
                      <TableRow
                        key={procedimento.id}
                        className={`hover:bg-muted/50 transition-all ${
                          idx % 2 === 0 ? "bg-white" : "bg-muted/20"
                        }`}
                      >
                        <TableCell className="font-semibold">{procedimento.nome}</TableCell>
                        <TableCell className="text-success-foreground font-semibold">
                          R$ {procedimento.preco.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(procedimento)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteDialog(procedimento)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm py-6 mt-8">
          <p className="text-secondary/70 font-medium">© 2025 FichaZen — Seu estúdio, mais zen 💆‍♀️✨</p>
        </footer>
      </main>

      {/* Add Procedure Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Novo Procedimento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Adicione um novo serviço ao seu catálogo
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Procedimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lash Lifting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="cta" disabled={createProcedure.isPending}>
                  {createProcedure.isPending ? (
                    <>Adicionando...</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Procedure Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Editar Procedimento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Atualize as informações do procedimento
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Procedimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lash Lifting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="cta" disabled={updateProcedure.isPending}>
                  {updateProcedure.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-primary">Remover Procedimento?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja remover <strong>{selectedProcedimento?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleteProcedure.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProcedure.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
