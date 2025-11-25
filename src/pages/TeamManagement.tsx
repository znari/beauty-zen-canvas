import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Pencil, Trash2, Users, Crown, AlertTriangle, User } from "lucide-react";
import { useTeamMembers, TeamMember } from "@/hooks/useTeamMembers";
import { useCreateTeamMember } from "@/hooks/useCreateTeamMember";
import { useUpdateTeamMember } from "@/hooks/useUpdateTeamMember";
import { useDeleteTeamMember } from "@/hooks/useDeleteTeamMember";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  specialty: string;
  is_active: boolean;
}

const initialFormData: MemberFormData = {
  name: "",
  phone: "",
  email: "",
  specialty: "",
  is_active: true,
};

export default function TeamManagement() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(initialFormData);

  const { data: members = [], isLoading } = useTeamMembers();
  const { data: subscription } = useSubscriptionStatus();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();

  const maxProfessionals = subscription?.limits.maxProfessionals;
  const currentCount = members.length;
  const canAddMore = maxProfessionals === null || currentCount < maxProfessionals;

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone || "",
      email: member.email || "",
      specialty: member.specialty || "",
      is_active: member.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    if (editingMember) {
      await updateMember.mutateAsync({
        id: editingMember.id,
        ...formData,
      });
    } else {
      await createMember.mutateAsync(formData);
    }

    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingMember(null);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMember.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando equipe..." />;
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Minha Equipe
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie os profissionais do seu estúdio
                </p>
              </div>
            </div>
            <Button
              onClick={handleOpenCreate}
              disabled={!canAddMore}
              variant="cta"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Usage Alert */}
        <Alert className="mb-6 border-primary/30 bg-primary/5">
          <Users className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{currentCount}</strong> de{" "}
              <strong>{maxProfessionals ?? "∞"}</strong> profissionais utilizados
            </span>
            {!canAddMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/pagamentos")}
              >
                Fazer Upgrade
              </Button>
            )}
          </AlertDescription>
        </Alert>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card
              key={member.id}
              className={`shadow-soft transition-all hover:shadow-card ${
                !member.is_active ? "opacity-60" : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {member.name}
                        {member.is_owner && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                      </h3>
                      {member.specialty && (
                        <p className="text-sm text-muted-foreground">
                          {member.specialty}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                {member.email && (
                  <p className="text-sm text-muted-foreground mb-1">
                    📧 {member.email}
                  </p>
                )}
                {member.phone && (
                  <p className="text-sm text-muted-foreground mb-3">
                    📱 {member.phone}
                  </p>
                )}

                {member.is_owner ? (
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1 pt-2 border-t border-border">
                    <Crown className="h-3 w-3 text-amber-500" />
                    Proprietário da conta
                  </p>
                ) : (
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenEdit(member)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirm(member)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Empty State Card */}
          {members.length === 1 && canAddMore && (
            <Card
              className="shadow-soft border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={handleOpenCreate}
            >
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">
                  Adicionar Profissional
                </p>
                <p className="text-sm text-muted-foreground">
                  Expanda sua equipe
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {editingMember ? "Editar Profissional" : "Novo Profissional"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Atualize os dados do profissional"
                : "Adicione um novo profissional à sua equipe"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Maria Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="maria@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                placeholder="Ex: Sobrancelhas, Cílios, Unhas"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Profissional Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Profissionais inativos não aparecem nos agendamentos
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name.trim() ||
                createMember.isPending ||
                updateMember.isPending
              }
              variant="cta"
            >
              {createMember.isPending || updateMember.isPending
                ? "Salvando..."
                : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Excluir Profissional?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deleteConfirm?.name}</strong>? Os agendamentos existentes
              serão mantidos, mas sem profissional responsável atribuído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMember.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
