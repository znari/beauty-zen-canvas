import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminStats,
  useAdminUsers,
  useAdminUsersDetailed,
  useAdminTransactions,
  useAdminGrowth,
  AdminUserDetailed,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserPlus,
  Calendar,
  LogOut,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  UserX,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  Building2,
  ArrowUpDown,
  Megaphone,
  Filter,
  X,
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
import { useState, useMemo } from "react";
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
import { format, subDays, subMonths, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { BroadcastModal } from "@/components/admin/BroadcastModal";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";

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

type SortField = "full_name" | "client_count" | "team_count" | "total_revenue" | "created_at";
type SortDirection = "asc" | "desc";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAdminUsers();
  const { data: usersDetailed, isLoading: usersDetailedLoading, refetch: refetchUsersDetailed } = useAdminUsersDetailed();
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useAdminTransactions();
  const { data: growth, isLoading: growthLoading, refetch: refetchGrowth } = useAdminGrowth();

  const terminateSessionsMutation = useTerminateSessions();

  const [confirmText, setConfirmText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtros avançados
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");

  // Modais
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailed | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  const isLoading = statsLoading || usersLoading || usersDetailedLoading || transactionsLoading || growthLoading;

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
    refetchUsersDetailed();
    refetchTransactions();
    refetchGrowth();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleTerminateSessions = async () => {
    try {
      await terminateSessionsMutation.mutateAsync();
      setConfirmText("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleExportCSV = () => {
    if (!usersDetailed || usersDetailed.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const headers = ["Nome", "Email", "Studio", "Plano", "Status", "Clientes", "Equipe", "Visitas", "Faturamento", "Cadastro"];
    const rows = usersDetailed.map(u => [
      u.full_name || "",
      u.email || "",
      u.studio_name || "",
      u.plan || "free",
      u.subscription_status || "trialing",
      u.client_count,
      u.team_count,
      u.visit_count,
      u.total_revenue.toFixed(2),
      u.created_at ? format(new Date(u.created_at), "dd/MM/yyyy") : "",
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios-fichazen-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exportação concluída!");
  };

  const handleRowClick = (user: AdminUserDetailed) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const clearFilters = () => {
    setFilterPlan("all");
    setFilterStatus("all");
    setFilterDate("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = filterPlan !== "all" || filterStatus !== "all" || filterDate !== "all" || searchQuery.length > 0;

  // Filtrar e ordenar usuários detalhados
  const filteredUsers = useMemo(() => {
    if (!usersDetailed) return [];
    
    let filtered = usersDetailed.filter(user => {
      // Busca textual
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.studio_name?.toLowerCase().includes(query);

      // Filtro de plano
      const matchesPlan = filterPlan === "all" || user.plan === filterPlan || (!user.plan && filterPlan === "free");

      // Filtro de status
      const matchesStatus = filterStatus === "all" || user.subscription_status === filterStatus;

      // Filtro de data
      let matchesDate = true;
      if (filterDate !== "all" && user.created_at) {
        const createdAt = new Date(user.created_at);
        const now = new Date();
        switch (filterDate) {
          case "7days":
            matchesDate = createdAt >= subDays(now, 7);
            break;
          case "30days":
            matchesDate = createdAt >= subDays(now, 30);
            break;
          case "90days":
            matchesDate = createdAt >= subDays(now, 90);
            break;
          case "thisyear":
            matchesDate = createdAt >= startOfYear(now);
            break;
        }
      }

      return matchesSearch && matchesPlan && matchesStatus && matchesDate;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "full_name":
          aVal = a.full_name || "";
          bVal = b.full_name || "";
          break;
        case "client_count":
          aVal = a.client_count;
          bVal = b.client_count;
          break;
        case "team_count":
          aVal = a.team_count;
          bVal = b.team_count;
          break;
        case "total_revenue":
          aVal = a.total_revenue;
          bVal = b.total_revenue;
          break;
        case "created_at":
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal as string) 
          : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal;
    });

    return filtered;
  }, [usersDetailed, searchQuery, sortField, sortDirection, filterPlan, filterStatus, filterDate]);

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Top 5 usuários por faturamento
  const topUsersByRevenue = useMemo(() => {
    if (!usersDetailed) return [];
    return [...usersDetailed]
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 5)
      .map(u => ({
        name: u.full_name || u.email?.split("@")[0] || "Sem nome",
        revenue: u.total_revenue,
      }));
  }, [usersDetailed]);

  // Médias
  const avgClientsPerUser = usersDetailed && usersDetailed.length > 0
    ? (usersDetailed.reduce((sum, u) => sum + u.client_count, 0) / usersDetailed.length).toFixed(1)
    : "0";

  const avgTeamPerUser = usersDetailed && usersDetailed.length > 0
    ? (usersDetailed.reduce((sum, u) => sum + u.team_count, 0) / usersDetailed.length).toFixed(1)
    : "0";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
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
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBroadcastModalOpen(true)}>
              <Megaphone className="w-4 h-4 mr-2" />
              Broadcast
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <UserX className="w-4 h-4 mr-2" />
                  Sessões
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-destructive" />
                    Encerrar Todas as Sessões?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      Esta ação irá <strong>desconectar TODOS os usuários</strong> do sistema, incluindo você.
                    </p>
                    <p className="text-yellow-500">
                      ⚠️ Todos os usuários precisarão fazer login novamente.
                    </p>
                    <div className="mt-4">
                      <p className="text-sm mb-2">Digite <strong>CONFIRMAR</strong> para prosseguir:</p>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="CONFIRMAR"
                        className="font-mono"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmText("")}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTerminateSessions}
                    disabled={confirmText !== "CONFIRMAR" || terminateSessionsMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {terminateSessionsMutation.isPending ? "Encerrando..." : "Encerrar Sessões"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards - Linha 1 */}
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

        {/* KPI Cards - Linha 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Taxa de Conversão */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversão
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
                {stats?.churned_users || 0} perdidos
              </div>
            </CardContent>
          </Card>

          {/* Novos este mês */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Novos/Mês
              </CardTitle>
              <UserPlus className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.new_users_this_month || 0}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                vs {stats?.new_users_last_month || 0} anterior
              </div>
            </CardContent>
          </Card>

          {/* Média Clientes/Usuário */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Méd. Clientes
              </CardTitle>
              <UsersRound className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{avgClientsPerUser}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                clientes/usuário
              </div>
            </CardContent>
          </Card>

          {/* Média Equipe/Usuário */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Méd. Equipe
              </CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{avgTeamPerUser}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                membros/usuário
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

        {/* Distribuição de Planos + Top 5 Faturamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Top 5 por Faturamento */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                🏆 Top 5 por Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topUsersByRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
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
                    <Bar dataKey="revenue" name="Faturamento" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Todos os Usuários */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg font-semibold text-foreground">
                  📊 Todos os Usuários
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Clique em uma linha para ver detalhes
                </p>
              </div>
              
              {/* Filtros Avançados */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                
                <Select value={filterPlan} onValueChange={(v) => { setFilterPlan(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos planos</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="essencial">Essencial</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="ultimate">Ultimate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    <SelectItem value="trialing">Em Trial</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDate} onValueChange={(v) => { setFilterDate(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Data cadastro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas datas</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="90days">Últimos 90 dias</SelectItem>
                    <SelectItem value="thisyear">Este ano</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>

              {hasActiveFilters && (
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} usuário(s) encontrado(s)
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("full_name")}
                    >
                      <div className="flex items-center gap-1">
                        Usuário
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground text-center"
                      onClick={() => handleSort("client_count")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Clientes
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground text-center"
                      onClick={() => handleSort("team_count")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Equipe
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground text-right"
                      onClick={() => handleSort("total_revenue")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Faturamento
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center gap-1">
                        Cadastro
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(user)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {user.full_name || "Sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          {user.studio_name && (
                            <p className="text-xs text-primary/70">{user.studio_name}</p>
                          )}
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
                      <TableCell className="text-center font-medium text-foreground">
                        {user.client_count}
                      </TableCell>
                      <TableCell className="text-center font-medium text-foreground">
                        {user.team_count}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-500">
                        R$ {user.total_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.created_at
                          ? format(new Date(user.created_at), "dd/MM/yy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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

      {/* Modais */}
      <BroadcastModal 
        open={broadcastModalOpen} 
        onOpenChange={setBroadcastModalOpen}
        totalUsers={stats?.total_users || 0}
      />

      <UserDetailsModal
        userId={selectedUser?.id || null}
        open={userDetailsOpen}
        onOpenChange={setUserDetailsOpen}
        userMetrics={selectedUser ? {
          client_count: selectedUser.client_count,
          team_count: selectedUser.team_count,
          visit_count: selectedUser.visit_count,
          total_revenue: selectedUser.total_revenue
        } : undefined}
      />
    </div>
  );
}
