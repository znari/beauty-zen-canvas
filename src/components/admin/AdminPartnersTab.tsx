import { useState } from "react";
import { 
  useAdminPartners, 
  useAdminPendingCommissions,
  useApprovePartner,
  useRejectPartner,
  useSuspendPartner,
  usePayCommissions
} from "@/hooks/useAdminPartners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  Copy,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminPartnersTab = () => {
  const { data: partners, isLoading: loadingPartners } = useAdminPartners();
  const { data: pendingCommissions, isLoading: loadingCommissions } = useAdminPendingCommissions();
  const { mutate: approvePartner, isPending: approving } = useApprovePartner();
  const { mutate: rejectPartner, isPending: rejecting } = useRejectPartner();
  const { mutate: suspendPartner, isPending: suspending } = useSuspendPartner();
  const { mutate: payCommissions, isPending: paying } = usePayCommissions();

  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [commissionValue, setCommissionValue] = useState("20");

  if (loadingPartners) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const pendingPartners = partners?.filter(p => p.status === 'pending') || [];
  const activePartners = partners?.filter(p => p.status === 'active') || [];
  const allPartners = partners || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (partner: any) => {
    approvePartner({ 
      partnerId: partner.id, 
      commissionValue: parseFloat(commissionValue) 
    });
  };

  const handleReject = () => {
    if (!selectedPartner || !rejectReason) return;
    rejectPartner({ partnerId: selectedPartner.id, reason: rejectReason }, {
      onSuccess: () => {
        setShowRejectDialog(false);
        setRejectReason("");
        setSelectedPartner(null);
      }
    });
  };

  const handlePaySelected = () => {
    if (selectedCommissions.length === 0) return;
    payCommissions({ 
      referralIds: selectedCommissions, 
      notes: paymentNotes 
    }, {
      onSuccess: () => {
        setShowPayDialog(false);
        setSelectedCommissions([]);
        setPaymentNotes("");
      }
    });
  };

  const toggleCommissionSelection = (id: string) => {
    setSelectedCommissions(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const copyPixKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Chave PIX copiada!");
  };

  const totalPendingAmount = (pendingCommissions || [])
    .filter(c => selectedCommissions.includes(c.referral_id))
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingPartners.length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activePartners.length}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{(pendingCommissions || []).length}</p>
                <p className="text-sm text-muted-foreground">Comissões pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  R$ {activePartners.reduce((sum, p) => sum + (p.total_paid || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Total pago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes ({pendingPartners.length})
          </TabsTrigger>
          <TabsTrigger value="commissions">
            Comissões ({(pendingCommissions || []).length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos ({allPartners.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Partners */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações pendentes</CardTitle>
              <CardDescription>Parceiros aguardando aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPartners.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma solicitação pendente</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>PIX</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{partner.phone || '-'}</TableCell>
                        <TableCell>
                          <span className="text-xs uppercase text-muted-foreground">{partner.pix_key_type}: </span>
                          {partner.pix_key}
                        </TableCell>
                        <TableCell>
                          {format(new Date(partner.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(partner)}
                              disabled={approving}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                setSelectedPartner(partner);
                                setShowRejectDialog(true);
                              }}
                              disabled={rejecting}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Commissions */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comissões pendentes</CardTitle>
                  <CardDescription>Comissões aguardando pagamento</CardDescription>
                </div>
                {selectedCommissions.length > 0 && (
                  <Button onClick={() => setShowPayDialog(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pagar selecionados (R$ {totalPendingAmount.toFixed(2)})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingCommissions ? (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              ) : (pendingCommissions || []).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma comissão pendente</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedCommissions.length === (pendingCommissions || []).length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCommissions((pendingCommissions || []).map(c => c.referral_id));
                            } else {
                              setSelectedCommissions([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Parceiro</TableHead>
                      <TableHead>Indicado</TableHead>
                      <TableHead>PIX</TableHead>
                      <TableHead>Data pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pendingCommissions || []).map((commission) => (
                      <TableRow key={commission.referral_id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedCommissions.includes(commission.referral_id)}
                            onCheckedChange={() => toggleCommissionSelection(commission.referral_id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{commission.partner_name}</p>
                            <p className="text-xs text-muted-foreground">{commission.partner_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{commission.referred_email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">
                              {commission.partner_pix_key_type}: {commission.partner_pix_key}
                            </span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6"
                              onClick={() => copyPixKey(commission.partner_pix_key)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(commission.first_payment_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {commission.commission_amount?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Partners */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos os parceiros</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Indicações</TableHead>
                    <TableHead>Pendente</TableHead>
                    <TableHead>Total pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-xs text-muted-foreground">{partner.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {partner.referral_code}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>{partner.total_referrals}</TableCell>
                      <TableCell>R$ {partner.pending_balance.toFixed(2)}</TableCell>
                      <TableCell>R$ {partner.total_paid.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar parceiro</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O parceiro receberá esta informação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo</Label>
              <Textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Não atende aos critérios do programa..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason || rejecting}
            >
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar pagamento</DialogTitle>
            <DialogDescription>
              Marcar {selectedCommissions.length} comissão(ões) como paga(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total a pagar</p>
              <p className="text-2xl font-bold">R$ {totalPendingAmount.toFixed(2)}</p>
            </div>
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea 
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Ex: Pago via PIX em 15/01/2025"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePaySelected} disabled={paying}>
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartnersTab;
