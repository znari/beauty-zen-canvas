import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerDashboard } from "@/hooks/usePartnerDashboard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PartnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, error } = usePartnerDashboard();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!data?.found) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Você não é um parceiro</CardTitle>
              <CardDescription>
                Para acessar o dashboard de parceiros, você precisa se cadastrar no programa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/parceiros">
                <Button className="w-full">Quero ser parceiro</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">Voltar ao dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const partner = data.partner!;
  const referrals = data.referrals || [];
  const payouts = data.payouts || [];

  const referralLink = `${window.location.origin}/r/${partner.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado!");
  };

  const copyPixKey = () => {
    if (partner.pix_key) {
      navigator.clipboard.writeText(partner.pix_key);
      toast.success("Chave PIX copiada!");
    }
  };

  const getPixKeyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'Email',
      phone: 'Telefone',
      random: 'Aleatória',
    };
    return labels[type] || type;
  };

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

  const getReferralStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return <Badge variant="outline">Cadastrado</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pagou</Badge>;
      case 'commission_pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Comissão pendente</Badge>;
      case 'commission_paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Comissão paga</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isPending = partner.status === 'pending';
  const isRejected = partner.status === 'rejected';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard do Parceiro</h1>
                <p className="text-sm text-muted-foreground">Acompanhe suas indicações e ganhos</p>
              </div>
            </div>
            {getStatusBadge(partner.status)}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isPending && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Aguardando aprovação</p>
                  <p className="text-sm text-yellow-700">
                    Sua solicitação está sendo analisada. Você receberá um email quando for aprovado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isRejected && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Solicitação rejeitada</p>
                  {partner.rejection_reason && (
                    <p className="text-sm text-muted-foreground">Motivo: {partner.rejection_reason}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Minha Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Nome
                </p>
                <p className="font-medium text-foreground">{partner.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Telefone
                </p>
                <p className="font-medium text-foreground">{partner.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  Tipo de chave PIX
                </p>
                <p className="font-medium text-foreground">{getPixKeyTypeLabel(partner.pix_key_type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chave PIX</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium font-mono text-foreground truncate">{partner.pix_key || '-'}</p>
                  {partner.pix_key && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyPixKey}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {partner.status === 'active' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Seu link de indicação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm truncate">
                  {referralLink}
                </code>
                <Button onClick={copyLink} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Código: <span className="font-mono font-bold">{partner.referral_code}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{partner.total_referrals}</p>
                  <p className="text-xs text-muted-foreground">Indicações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {partner.pending_balance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Pendente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {partner.total_paid.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total recebido</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {partner.commission_value.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Por indicação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrals">
          <TabsList>
            <TabsTrigger value="referrals">Indicações</TabsTrigger>
            <TabsTrigger value="payouts">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Suas indicações</CardTitle>
                <CardDescription>Acompanhe o status de cada pessoa que você indicou</CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma indicação ainda</p>
                    <p className="text-sm">Compartilhe seu link para começar a ganhar!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.referred_email}</TableCell>
                          <TableCell>
                            {format(new Date(referral.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{getReferralStatusBadge(referral.status)}</TableCell>
                          <TableCell className="text-right">
                            {referral.commission_amount 
                              ? `R$ ${referral.commission_amount.toFixed(2)}`
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de pagamentos</CardTitle>
                <CardDescription>Todos os pagamentos que você recebeu</CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pagamento ainda</p>
                    <p className="text-sm">Suas comissões aparecerão aqui quando forem pagas</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            {format(new Date(payout.paid_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            R$ {payout.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payout.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PartnerDashboard;