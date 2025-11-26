import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, TrendingUp, Calendar, DollarSign, Users, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillingStats } from "@/hooks/useBillingStats";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { exportBillingToPDF } from "@/lib/exportBillingPDF";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useBlockedActions } from "@/hooks/useBlockedActions";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#F59E0B", "#10B981", "#3B82F6"];

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [studioName, setStudioName] = useState<string>("Studio");
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  
  const { data: teamMembers = [] } = useTeamMembers(false); // incluir inativos para histórico
  const { data: stats, isLoading } = useBillingStats(selectedMonth, selectedProfessional);
  const { checkPermission, canExportPDF } = useBlockedActions();

  useEffect(() => {
    const fetchStudioName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('studio_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data?.studio_name) {
          setStudioName(data.studio_name);
        }
      }
    };
    fetchStudioName();
  }, []);

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  const handleExportPDF = () => {
    if (!stats) return;
    if (!checkPermission('export')) return;
    
    try {
      // Obter nome do profissional selecionado (se filtrado)
      const professionalName = selectedProfessional 
        ? teamMembers.find(m => m.id === selectedProfessional)?.name 
        : null;
      
      exportBillingToPDF(stats, selectedMonth, studioName, professionalName);
      toast({
        title: "PDF exportado com sucesso!",
        description: professionalName 
          ? `Relatório de ${professionalName} foi baixado.`
          : "O relatório consolidado foi baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const monthText = format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR });
  const formattedMonth = monthText.charAt(0).toUpperCase() + monthText.slice(1);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero">
        <LoadingSpinner message="Carregando dados financeiros..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    );
  }

  const avgTicket = stats.completedVisits > 0 ? stats.totalRevenue / stats.completedVisits : 0;

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-secondary hover:text-primary"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold text-primary">Faturamento</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Month Navigation + Professional Filter */}
        <Card className="bg-white shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousMonth}
                className="border-primary/30 hover:bg-primary/10"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Mês Anterior
              </Button>
              
              <div className="text-center flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold text-secondary">{formattedMonth}</h2>
                {selectedProfessional && (
                  <span className="text-sm text-muted-foreground">
                    Filtrando: {teamMembers.find(m => m.id === selectedProfessional)?.name}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2 flex-wrap justify-end">
                {/* Filtro por profissional */}
                <Select 
                  value={selectedProfessional || "all"} 
                  onValueChange={(v) => setSelectedProfessional(v === "all" ? null : v)}
                >
                  <SelectTrigger className="w-[200px] border-primary/30">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="Todos os profissionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os profissionais</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} {member.is_owner && "👑"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleNextMonth}
                  className="border-primary/30 hover:bg-primary/10"
                  disabled={selectedMonth >= new Date()}
                >
                  Próximo Mês
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  onClick={handleExportPDF}
                  className="gradient-button text-white font-semibold"
                  disabled={!canExportPDF}
                >
                  <Download className="h-5 w-5 mr-2" />
                  {canExportPDF ? "Exportar PDF" : "Bloqueado"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
          <Card className="bg-white border-b-4 border-b-primary shadow-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Faturamento Total
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                R$ {stats.totalRevenue.toFixed(2)}
              </div>
              {stats.revenueGrowth !== 0 && (
                <p className={`text-sm mt-2 flex items-center gap-1 ${stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  <TrendingUp className="h-4 w-4" />
                  {stats.revenueGrowth >= 0 ? "+" : ""}{stats.revenueGrowth.toFixed(1)}% vs mês anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-b-4 border-b-secondary shadow-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Visitas Realizadas
              </CardTitle>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.completedVisits}</div>
              <p className="text-sm text-muted-foreground mt-2">
                de {stats.totalVisits} agendadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-b-4 border-b-accent shadow-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Ticket Médio
              </CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                R$ {avgTicket.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">por visita</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-b-4 border-b-yellow-500 shadow-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Receita Pendente
              </CardTitle>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                R$ {stats.totalPendingRevenue.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">visitas agendadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Revenue Chart */}
        {stats.dailyRevenue.length > 0 && (
          <Card className="bg-white shadow-card border-0 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Faturamento Diário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, "Faturamento"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Procedimentos */}
          <Card className="bg-white shadow-card border-0 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Top 5 Procedimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topProcedures.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Procedimento</TableHead>
                      <TableHead className="text-center">Qtd.</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topProcedures.map((proc, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{proc.name}</TableCell>
                        <TableCell className="text-center">{proc.count}</TableCell>
                        <TableCell className="text-right font-semibold">
                          R$ {proc.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum procedimento realizado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top 5 Clientes */}
          <Card className="bg-white shadow-card border-0 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top 5 Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topClients.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Visitas</TableHead>
                      <TableHead className="text-right">Total Gasto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topClients.map((client, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => navigate(`/cliente/${client.id}`)}
                      >
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="text-center">{client.visits}</TableCell>
                        <TableCell className="text-right font-semibold">
                          R$ {client.totalSpent.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum cliente com visitas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Procedure Distribution Pie Chart */}
        {stats.procedureDistribution.length > 0 && (
          <Card className="bg-white shadow-card border-0 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Distribuição por Procedimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={stats.procedureDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  >
                    {stats.procedureDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Billing;
