import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Calendar, CreditCard, Building2, Phone, Mail, MapPin, Crown, User, Send, Save, Settings } from 'lucide-react';
import { useAdminUserDetails } from '@/hooks/useAdminUserDetails';
import { useAdminUpdatePlan } from '@/hooks/useAdminUpdatePlan';
import { SendNotificationModal } from './SendNotificationModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userMetrics?: {
    client_count: number;
    team_count: number;
    visit_count: number;
    total_revenue: number;
  };
}

export function UserDetailsModal({ userId, open, onOpenChange, userMetrics }: UserDetailsModalProps) {
  const { data, isLoading } = useAdminUserDetails(userId);
  const { mutate: updatePlan, isPending: isUpdating } = useAdminUpdatePlan();

  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Sincronizar estado quando dados carregam
  useEffect(() => {
    if (data?.profile) {
      setEditPlan(data.profile.plan || "free");
      setEditStatus(data.profile.subscription_status || "trialing");
      setEditEndsAt(data.profile.subscription_ends_at ? data.profile.subscription_ends_at.split("T")[0] : "");
    }
  }, [data]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Ativo', variant: 'default' },
      trialing: { label: 'Em Trial', variant: 'secondary' },
      expired: { label: 'Expirado', variant: 'destructive' },
      cancelled: { label: 'Cancelado', variant: 'outline' }
    };
    const config = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const planMap: Record<string, string> = {
      free: 'Free',
      essencial: 'Essencial',
      pro: 'Pro',
      ultimate: 'Ultimate'
    };
    return planMap[plan] || plan;
  };

  const handleSavePlan = () => {
    if (!userId) return;
    updatePlan({
      userId,
      plan: editPlan,
      subscriptionStatus: editStatus,
      subscriptionEndsAt: editEndsAt ? new Date(editEndsAt).toISOString() : null
    });
  };

  const hasChanges = data?.profile && (
    editPlan !== (data.profile.plan || "free") ||
    editStatus !== (data.profile.subscription_status || "trialing") ||
    editEndsAt !== (data.profile.subscription_ends_at ? data.profile.subscription_ends_at.split("T")[0] : "")
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes do Usuário
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : data?.profile ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {data.profile.full_name?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-semibold">{data.profile.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{data.profile.email}</span>
                      {data.profile.phone_raw && (
                        <>
                          <span>•</span>
                          <Phone className="h-3.5 w-3.5" />
                          <span>{data.profile.phone_raw}</span>
                        </>
                      )}
                    </div>
                    {data.profile.studio_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{data.profile.studio_name}</span>
                      </div>
                    )}
                    {(data.profile.address_city || data.profile.address_state) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{[data.profile.address_city, data.profile.address_state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline">{getPlanBadge(data.profile.plan)}</Badge>
                      {getStatusBadge(data.profile.subscription_status)}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationModalOpen(true)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Notificar
                  </Button>
                </div>

                {/* Manage Subscription */}
                <div className="p-4 border border-border rounded-lg space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Gerenciar Assinatura
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan">Plano</Label>
                      <Select value={editPlan} onValueChange={setEditPlan}>
                        <SelectTrigger id="plan">
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="essencial">Essencial</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="ultimate">Ultimate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trialing">Em Trial</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="expired">Expirado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ends_at">Expira em</Label>
                      <Input
                        id="ends_at"
                        type="date"
                        value={editEndsAt}
                        onChange={(e) => setEditEndsAt(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSavePlan}
                    disabled={!hasChanges || isUpdating}
                    size="sm"
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isUpdating ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>

                {/* Dates Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">Cadastro</p>
                    <p className="font-medium">{formatDate(data.profile.created_at)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">Fim Trial</p>
                    <p className="font-medium">{formatDate(data.profile.trial_ends_at)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">Início Assinatura</p>
                    <p className="font-medium">{formatDate(data.profile.subscription_started_at)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">Fim Assinatura</p>
                    <p className="font-medium">{formatDate(data.profile.subscription_ends_at)}</p>
                  </div>
                </div>

                {/* Metrics */}
                {userMetrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{userMetrics.client_count}</p>
                      <p className="text-xs text-muted-foreground">Clientes</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{userMetrics.team_count}</p>
                      <p className="text-xs text-muted-foreground">Equipe</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{userMetrics.visit_count}</p>
                      <p className="text-xs text-muted-foreground">Visitas</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(userMetrics.total_revenue)}</p>
                      <p className="text-xs text-muted-foreground">Faturamento</p>
                    </div>
                  </div>
                )}

                {/* Clients */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Clientes ({data.clients?.length || 0})
                  </h4>
                  {data.clients && data.clients.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>WhatsApp</TableHead>
                            <TableHead>Cadastro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.clients.slice(0, 5).map((client) => (
                            <TableRow key={client.id}>
                              <TableCell className="font-medium">{client.name}</TableCell>
                              <TableCell>{client.whatsapp_raw || '-'}</TableCell>
                              <TableCell>{formatDate(client.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                      Nenhum cliente cadastrado
                    </p>
                  )}
                </div>

                {/* Team */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Equipe ({data.team?.length || 0})
                  </h4>
                  {data.team && data.team.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Especialidade</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.team.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {member.name}
                                  {member.is_owner && (
                                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{member.specialty || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={member.is_active ? 'default' : 'secondary'}>
                                  {member.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                      Nenhum membro na equipe
                    </p>
                  )}
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Histórico de Pagamentos ({data.transactions?.length || 0})
                  </h4>
                  {data.transactions && data.transactions.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Gateway</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.transactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>{formatDate(tx.created_at)}</TableCell>
                              <TableCell>{tx.plan_id}</TableCell>
                              <TableCell>{formatCurrency(tx.amount)}</TableCell>
                              <TableCell>
                                <Badge variant={tx.status === 'paid' ? 'default' : 'secondary'}>
                                  {tx.status === 'paid' ? 'Pago' : tx.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="capitalize">{tx.payment_gateway || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                      Nenhum pagamento registrado
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Usuário não encontrado
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Send Notification Modal */}
      {userId && data?.profile && (
        <SendNotificationModal
          open={notificationModalOpen}
          onOpenChange={setNotificationModalOpen}
          userId={userId}
          userName={data.profile.full_name || data.profile.email || "Usuário"}
        />
      )}
    </>
  );
}