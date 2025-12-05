import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminStats,
  useAdminUsers,
  useAdminTransactions,
  useAdminGrowth,
} from "@/hooks/useAdminStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserPlus,
  Calendar,
  FileText,
  LogOut,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  UserX,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useTerminateSessions } from "@/hooks/useTerminateSessions";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLAN_COLORS = {
  free: "#9CA3AF",
  essencial: "#10B981",
  pro: "#8B5CF6",
  ultimate: "#F59E0B",
};

const STATUS_COLORS = {
  trialing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  expired: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const PAYMENT_STATUS_COLORS = {
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAdminUsers();
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useAdminTransactions();
  const { data: growth, isLoading: growthLoading, refetch: refetchGrowth } = useAdminGrowth();

  const isLoading = statsLoading || usersLoading || transactionsLoading || growthLoading;

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
    refetchTransactions();
    refetchGrowth();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Calcular distribuição de planos
  const planDistribution = users
    ? [
        { name: "Free", value: users.filter((u) => u.plan === "free" || !u.plan).length, color: PLAN_COLORS.free },
        { name: "Essencial", value: users.filter((u) => u.plan === "essencial").length, color: PLAN_COLORS.essencial },
        { name: "Pro", value: users.filter((u) => u.plan === "pro").length, color: PLAN_COLORS.pro },
        { name: "Ultimate", value: users.filter((u) => u.plan === "ultimate").length, color: PLAN_COLORS.ultimate },
      ].filter((p) => p.value > 0)
    : [];

  // Calcular crescimento percentual
  const userGrowthPercent =
    stats && stats.new_users_last_month > 0
      ? Math.round(((stats.new_users_this_month - stats.new_users_last_month) / stats.new_users_last_month) * 100)
      : stats?.new_users_this_month ? 100 : 0;

  // Calcular churn rate
  const churnRate =
    stats && stats.total_users > 0
      ? ((stats.churned_users / stats.total_users) * 100).toFixed(1)
      : "0";

  // Calcular ticket médio
  const avgTicket =
    stats && stats.paid_transactions > 0
      ? (stats.total_revenue / stats.paid_transactions).toFixed(2)
      : "0";

  // Calcular taxa de conversão (trial -> ativo)
  const conversionRate =
    stats && (stats.trial_users + stats.active_subscribers) > 0
      ? ((stats.active_subscribers / (stats.trial_users + stats.active_subscribers)) * 100).toFixed(1)
      : "0";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner message="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FichaZen Admin</h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Usuários Totais */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuários Totais
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_users || 0}</div>
              <div className="flex items-center gap-1 mt-1">
                {userGrowthPercent >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${userGrowthPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {userGrowthPercent >= 0 ? "+" : ""}{userGrowthPercent}% vs mês anterior
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="text-blue-400">{stats?.trial_users || 0} em trial</span>
                {" • "}
                <span className="text-green-400">{stats?.active_subscribers || 0} ativos</span>
              </div>
            </CardContent>
          </Card>

          {/* MRR */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                MRR
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                R$ {(stats?.mrr || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Receita recorrente mensal
              </div>
              <div className="mt-2 text-xs">
                <span className="text-green-400">{stats?.active_subscribers || 0} assinantes</span>
              </div>
            </CardContent>
          </Card>

          {/* Receita Total */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                R$ {(stats?.total_revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Ticket médio: R$ {avgTicket}
              </div>
              <div className="mt-2 text-xs">
                <span className="text-green-400">{stats?.paid_transactions || 0} pagamentos</span>
                {" • "}
                <span className="text-yellow-400">{stats?.pending_transactions || 0} pendentes</span>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Engajamento */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Engajamento
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Clientes</span>
                  <span className="text-sm font-semibold text-foreground">{stats?.total_clients || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Visitas</span>
                  <span className="text-sm font-semibold text-foreground">{stats?.total_visits || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Anamneses</span>
                  <span className="text-sm font-semibold text-foreground">{stats?.filled_anamneses || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda linha de KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Taxa de Conversão */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conversão
              </CardTitle>
              <UserPlus className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{conversionRate}%</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Trial → Assinante
              </div>
            </CardContent>
          </Card>

          {/* Churn Rate */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Churn Rate
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{churnRate}%</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {stats?.churned_users || 0} usuários perdidos
              </div>
            </CardContent>
          </Card>

          {/* Novos este mês */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Novos Este Mês
              </CardTitle>
              <UserPlus className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.new_users_this_month || 0}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                vs {stats?.new_users_last_month || 0} mês passado
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Crescimento */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                📈 Crescimento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="new_users"
                      name="Novos Usuários"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ fill: "#8B5CF6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="new_subscribers"
                      name="Novos Assinantes"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: "#10B981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Receita */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                💰 Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      formatter={(value: number) =>
                        `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      }
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="revenue" name="Receita" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                🥧 Distribuição de Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Últimos Cadastros */}
          <Card className="border-border/50 bg-card/50 backdrop-blur lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                👤 Últimos Cadastros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.slice(0, 5).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {user.full_name || "Sem nome"}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: PLAN_COLORS[user.plan as keyof typeof PLAN_COLORS] || PLAN_COLORS.free,
                              color: PLAN_COLORS[user.plan as keyof typeof PLAN_COLORS] || PLAN_COLORS.free,
                            }}
                          >
                            {user.plan || "free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[user.subscription_status as keyof typeof STATUS_COLORS] || STATUS_COLORS.trialing}
                          >
                            {user.subscription_status || "trialing"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.created_at
                            ? format(new Date(user.created_at), "dd/MM/yy", { locale: ptBR })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimas Transações */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              💳 Últimas Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.slice(0, 10).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {tx.user_name || "Sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: PLAN_COLORS[tx.plan_id as keyof typeof PLAN_COLORS] || PLAN_COLORS.free,
                            color: PLAN_COLORS[tx.plan_id as keyof typeof PLAN_COLORS] || PLAN_COLORS.free,
                          }}
                        >
                          {tx.plan_id}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        R$ {tx.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.payment_gateway || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={PAYMENT_STATUS_COLORS[tx.status as keyof typeof PAYMENT_STATUS_COLORS] || PAYMENT_STATUS_COLORS.pending}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.created_at
                          ? format(new Date(tx.created_at), "dd/MM/yy HH:mm", { locale: ptBR })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
