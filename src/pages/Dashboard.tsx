import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, FileText, Settings, Search, Plus, MessageSquare, User, Clipboard, HelpCircle, LifeBuoy, LogOut, CheckCircle2, XCircle, X, Send, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWeeklyVisits } from "@/hooks/useWeeklyVisits";
import { useMonthlyVisits } from "@/hooks/useMonthlyVisits";
import { useClients } from "@/hooks/useClients";
import { useCompleteVisit } from "@/hooks/useCompleteVisit";
import { useUpdateVisit } from "@/hooks/useUpdateVisit";
import { useCancelVisit } from "@/hooks/useCancelVisit";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addDays, format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatLocalDate } from "@/lib/dateUtils";
import { openWhatsAppMessage, generateAnamnesisLink } from "@/lib/whatsapp";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showMonthlyCalendar, setShowMonthlyCalendar] = useState(false);
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const [selectedDayInMonth, setSelectedDayInMonth] = useState<Date | undefined>();

  // Mutation hooks
  const completeVisit = useCompleteVisit();
  const updateVisit = useUpdateVisit();
  const cancelVisit = useCancelVisit();

  // Fetch data from Supabase
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: weeklyVisits = {}, isLoading: visitsLoading } = useWeeklyVisits();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: monthlyVisits = {}, isLoading: monthlyLoading } = useMonthlyVisits(selectedMonthDate);

  // Generate week days dinamicamente
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const mockWeekDays = Array.from({ length: 6 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      day: format(date, "EEEE", { locale: ptBR }),
      date: format(date, "dd/MM"),
    };
  });

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["clients"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const kpiData = [
    { icon: Users, label: "Total de Clientes", value: stats?.totalClients || 0 },
    { icon: FileText, label: "Fichas Pendentes", value: stats?.pendingAnamneses || 0 },
    { icon: Calendar, label: "Visitas da Semana", value: stats?.visitsThisWeek || 0 },
  ];

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
    navigate("/login");
  };

  const handleCompleteVisit = async () => {
    if (!selectedAppointment?.id) return;

    try {
      await completeVisit.mutateAsync(selectedAppointment.id);
      
      toast({
        title: "✅ Procedimento realizado!",
        description: `${selectedAppointment.client} - ${selectedAppointment.procedure} marcado como concluído.`,
      });
      
      setSelectedAppointment(null);
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment?.id) return;

    try {
      await cancelVisit.mutateAsync(selectedAppointment.id);
      
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
        variant: "destructive",
      });
      
      setSelectedAppointment(null);
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendAnamnesisForm = () => {
    if (!selectedAppointment?.clientId) return;
    
    const anamnesisLink = generateAnamnesisLink(selectedAppointment.clientId);
    
    openWhatsAppMessage("EnvioFicha", {
      nomeCliente: selectedAppointment.client,
      telefone: "",
      linkFicha: anamnesisLink,
      nomeStudio: "FichaZen"
    });
    
    toast({
      title: "📲 WhatsApp aberto",
      description: `Ficha de anamnese pronta para enviar para ${selectedAppointment.client}`,
    });
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment?.id) return;

    try {
      const { error } = await supabase
        .from("visits")
        .delete()
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      toast({
        title: "🗑️ Agendamento excluído",
        description: "O agendamento foi removido permanentemente.",
      });

      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReschedule = () => {
    setShowRescheduleForm(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a nova data e horário",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateVisit.mutateAsync({
        visitId: selectedAppointment.id,
        visit_date: rescheduleDate,
        visit_time: rescheduleTime,
      });

      toast({
        title: "✅ Visita reagendada",
        description: `Nova data: ${formatLocalDate(rescheduleDate, "dd/MM/yyyy")} às ${rescheduleTime}`,
      });

      setShowRescheduleForm(false);
      setSelectedAppointment(null);
      setRescheduleDate("");
      setRescheduleTime("");
    } catch (error: any) {
      toast({
        title: "Erro ao reagendar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNewClient = () => {
    toast({
      title: "Cliente cadastrado",
      description: "Novo cliente adicionado com sucesso!",
    });
    setShowNewClientDialog(false);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const getDaysWithAppointments = (): Date[] => {
    return Object.keys(monthlyVisits).map(dateStr => parseISO(dateStr));
  };

  const getAppointmentsForDay = (date: Date | undefined) => {
    if (!date) return [];
    const dateKey = format(date, "yyyy-MM-dd");
    return monthlyVisits[dateKey] || [];
  };

  // Loading state
  if (statsLoading || visitsLoading || clientsLoading) {
    return (
      <div className="min-h-screen gradient-hero">
        <LoadingSpinner message="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">FichaZen</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-secondary hover:text-primary hover:bg-primary/10">
                <Settings className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => navigate("/configuracoes/perfil")}>
                <User className="h-4 w-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes/procedimentos")}>
                <Clipboard className="h-4 w-4 mr-2" />
                Procedimentos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes/ficha-anamnese")}>
                <FileText className="h-4 w-4 mr-2" />
                Ficha de Anamnese
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes/mensagens")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensagens do WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 mr-2" />
                Ajuda
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy className="h-4 w-4 mr-2" />
                Suporte
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="bg-white border-b-4 border-b-primary shadow-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {kpi.label}
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-secondary">{kpi.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly Calendar */}
        <Card className="bg-white shadow-card border-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Agenda Semanal
              </CardTitle>
              <Button
                onClick={() => setShowMonthlyCalendar(true)}
                variant="outline"
                className="border-primary hover:bg-primary/10 font-semibold"
              >
                <CalendarDays className="h-5 w-5 mr-2" />
                Agendamentos do Mês
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockWeekDays.map((day) => (
                <div key={day.date} className="space-y-3">
                  <div className="text-center p-3 bg-primary text-white rounded-xl shadow-sm">
                    <div className="font-semibold text-base capitalize">{day.day}</div>
                    <div className="text-sm opacity-90">{day.date}</div>
                  </div>
                  <div className="space-y-2">
                    {weeklyVisits[day.date]?.length > 0 ? (
                      weeklyVisits[day.date].map((apt: any) => {
                        // Definir classes CSS baseado no visualStatus
                        let cardClasses = "w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02] hover:shadow-md border-2";
                        
                        if (apt.visualStatus === "completed") {
                          cardClasses += " bg-green-50 border-green-400 hover:bg-green-100";
                        } else if (apt.visualStatus === "cancelled") {
                          cardClasses += " bg-red-50 border-red-400 hover:bg-red-100 opacity-60";
                        } else if (apt.visualStatus === "pending") {
                          cardClasses += " bg-yellow-50 border-yellow-400 hover:bg-yellow-100";
                        } else if (apt.visualStatus === "confirmed") {
                          cardClasses += " bg-green-50 border-green-400 hover:bg-green-100";
                        } else {
                          cardClasses += " bg-white border-primary/20 hover:bg-accent/30";
                        }
                        
                        return (
                          <button
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className={cardClasses}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-bold text-secondary flex items-center gap-1">
                                <span>🕓</span> {apt.time}
                              </div>
                              {apt.visualStatus === "completed" && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                              {apt.visualStatus === "cancelled" && (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              {apt.visualStatus === "pending" && (
                                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                              )}
                              {apt.visualStatus === "confirmed" && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="text-sm font-semibold text-foreground mt-1">{apt.client}</div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed border-primary/30 rounded-xl bg-muted/30">
                        Nenhum agendamento
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clients Section */}
        <Card className="bg-white shadow-card border-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
                <Users className="h-6 w-6" />
                Meus Clientes
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/clientes")}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10"
                >
                  Ver Todos
                </Button>
                <Button
                  onClick={() => navigate("/clientes/novo")}
                  className="gradient-button text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Cliente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-primary/20 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-accent/30 hover:bg-accent/30">
                    <TableHead className="font-bold text-secondary">Cliente</TableHead>
                    <TableHead className="font-bold text-secondary">WhatsApp</TableHead>
                    <TableHead className="font-bold text-secondary">Status da Ficha</TableHead>
                    <TableHead className="font-bold text-secondary">Última Atividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.slice(0, 5).map((client, idx) => (
                    <TableRow 
                      key={client.id} 
                      onClick={() => navigate(`/cliente/${client.id}`)}
                      className={`cursor-pointer hover:bg-muted/50 transition-all hover:shadow-sm ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'
                      }`}
                    >
                      <TableCell className="font-semibold text-foreground">{client.name}</TableCell>
                      <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={client.anamnesisStatus === "Preenchida" ? "active" : "pending"}
                        >
                          {client.anamnesisStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.lastVisit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {clients.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  onClick={() => navigate("/clientes")}
                  variant="ghost"
                  className="text-primary hover:text-primary-dark"
                >
                  Ver todos os {clients.length} clientes →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm py-6">
          <p className="text-secondary/70 font-medium">© 2025 FichaZen — Seu estúdio, mais zen.</p>
        </footer>
      </main>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-white border-primary/20 shadow-xl w-full max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Detalhes do Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações completas sobre este agendamento
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <>
              {/* Indicador de status da ficha */}
              {selectedAppointment.visualStatus === "pending" && (
                <div className="p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
                    <p className="text-sm font-semibold text-yellow-700">
                      ⚠️ Ficha de anamnese pendente
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-primary uppercase tracking-wide">Cliente</Label>
                  <p className="text-base font-semibold text-foreground mt-1">{selectedAppointment.client}</p>
                </div>
              <div>
                <Label className="text-xs font-bold text-primary uppercase tracking-wide">Procedimento</Label>
                <p className="text-base font-semibold text-foreground mt-1">{selectedAppointment.procedure}</p>
              </div>
              <div>
                <Label className="text-xs font-bold text-primary uppercase tracking-wide">Horário</Label>
                <p className="text-base font-semibold text-foreground mt-1">{selectedAppointment.time}</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-xs font-bold text-primary uppercase tracking-wide">Observações</Label>
                  <p className="text-base text-foreground mt-1">{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.status === "completed" && selectedAppointment.completedAt && (
                <div className="p-3 bg-green-50 border border-green-500 rounded-lg mt-4">
                  <Label className="text-xs font-bold text-green-700 uppercase tracking-wide">Status</Label>
                  <p className="text-base font-semibold text-green-700 mt-1">✅ Procedimento Realizado</p>
                  <p className="text-sm text-green-600 mt-1">Confirmado em {selectedAppointment.completedAt}</p>
                </div>
              )}
              {selectedAppointment.status === "cancelled" && (
                <div className="p-3 bg-red-50 border border-red-500 rounded-lg mt-4">
                  <Label className="text-xs font-bold text-red-700 uppercase tracking-wide">Status</Label>
                  <p className="text-base font-semibold text-red-700 mt-1">❌ Agendamento Cancelado</p>
                </div>
              )}
              </div>
            </>
          )}
          
          {showRescheduleForm && selectedAppointment?.status === "scheduled" && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border-2 border-primary/20 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-primary">Reagendar Visita</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRescheduleForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reschedule-date">Nova Data</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reschedule-time">Novo Horário</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleConfirmReschedule}
                disabled={updateVisit.isPending}
                className="w-full gradient-button"
              >
                {updateVisit.isPending ? "Reagendando..." : "✅ Confirmar Reagendamento"}
              </Button>
            </div>
          )}
          
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-primary/10">
            {/* BOTÕES PARA AGENDAMENTOS AGENDADOS */}
            {selectedAppointment?.status === "scheduled" && (
              <>
                {/* Se ficha pendente: botão para enviar WhatsApp */}
                {selectedAppointment?.visualStatus === "pending" && (
                  <Button 
                    onClick={handleSendAnamnesisForm}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md hover:shadow-lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    📲 Enviar Ficha WhatsApp
                  </Button>
                )}
                
                {/* Botões padrão para agendados */}
                <Button 
                  onClick={handleCompleteVisit}
                  disabled={completeVisit.isPending}
                  className="w-full gradient-button text-white font-semibold shadow-md hover:shadow-lg"
                >
                  {completeVisit.isPending ? "Confirmando..." : "✅ Confirmar Realização"}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleReschedule}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    📅 Reagendar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelAppointment}
                    disabled={cancelVisit.isPending}
                  >
                    {cancelVisit.isPending ? "Cancelando..." : "❌ Cancelar"}
                  </Button>
                </div>
              </>
            )}
            
            {/* BOTÕES PARA AGENDAMENTOS CONCLUÍDOS */}
            {selectedAppointment?.status === "completed" && (
              <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 font-semibold">✅ Procedimento já realizado</p>
                {selectedAppointment.completedAt && (
                  <p className="text-green-600 text-sm mt-1">Confirmado em {selectedAppointment.completedAt}</p>
                )}
              </div>
            )}
            
            {/* BOTÕES PARA AGENDAMENTOS CANCELADOS */}
            {selectedAppointment?.status === "cancelled" && (
              <>
                <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-center mb-3">
                  <p className="text-red-700 font-semibold">❌ Agendamento cancelado</p>
                </div>
                
                {/* Ações específicas para cancelados */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleReschedule}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    📅 Reagendar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAppointment}
                  >
                    🗑️ Excluir
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Novo Cliente</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cadastre um novo cliente no seu estúdio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-secondary font-semibold">Nome completo</Label>
              <Input 
                id="name" 
                placeholder="Digite o nome do cliente" 
                className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-secondary font-semibold">WhatsApp</Label>
              <Input 
                id="phone" 
                placeholder="(11) 98765-4321" 
                className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-secondary font-semibold">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="cliente@exemplo.com" 
                className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 mt-1" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewClientDialog(false)} 
              className="border-primary/30 hover:bg-primary/10"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleNewClient} 
              className="gradient-button text-white font-semibold shadow-md hover:shadow-lg"
            >
              Cadastrar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monthly Calendar Dialog */}
      <Dialog open={showMonthlyCalendar} onOpenChange={setShowMonthlyCalendar}>
        <DialogContent className="bg-white border-primary/20 shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              Agendamentos do Mês
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Visualize todos os seus agendamentos do mês
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Calendário */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="font-semibold text-lg text-primary capitalize">
                  {format(selectedMonthDate, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-muted/20">
                <CalendarComponent
                  mode="single"
                  selected={selectedDayInMonth}
                  onSelect={setSelectedDayInMonth}
                  month={selectedMonthDate}
                  onMonthChange={setSelectedMonthDate}
                  modifiers={{
                    hasAppointment: getDaysWithAppointments(),
                  }}
                  modifiersStyles={{
                    hasAppointment: {
                      backgroundColor: "hsl(var(--primary))",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "50%",
                    },
                  }}
                  className="pointer-events-auto"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span>Dias com agendamentos</span>
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos do Dia Selecionado */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary">
                {selectedDayInMonth 
                  ? `Agendamentos de ${format(selectedDayInMonth, "dd/MM/yyyy", { locale: ptBR })}`
                  : "Selecione um dia"}
              </h3>

              {monthlyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner message="Carregando..." />
                </div>
              ) : selectedDayInMonth ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {getAppointmentsForDay(selectedDayInMonth).length > 0 ? (
                    getAppointmentsForDay(selectedDayInMonth).map((apt) => (
                      <Card 
                        key={apt.id} 
                        className={`shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${
                          apt.status === "completed" ? "border-l-green-500 bg-green-50/50" :
                          apt.status === "cancelled" ? "border-l-red-500 bg-red-50/50" :
                          !apt.anamnesis_filled ? "border-l-yellow-500 bg-yellow-50/50" :
                          "border-l-primary bg-white"
                        }`}
                        onClick={() => {
                          setShowMonthlyCalendar(false);
                          // Aqui você pode abrir o dialog de detalhes se quiser
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-secondary">
                                  🕓 {apt.visit_time.slice(0, 5)}
                                </span>
                                {apt.status === "completed" && (
                                  <Badge variant="default" className="text-xs bg-green-600">Realizado</Badge>
                                )}
                                {apt.status === "cancelled" && (
                                  <Badge variant="destructive" className="text-xs">Cancelado</Badge>
                                )}
                                {!apt.anamnesis_filled && apt.status === "scheduled" && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">Ficha Pendente</Badge>
                                )}
                              </div>
                              <p className="font-semibold text-foreground">{apt.client_name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {apt.procedures.map((p: any) => p.nome).join(", ")}
                              </p>
                            </div>
                            {apt.status === "completed" && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                            {apt.status === "cancelled" && (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-primary/30 rounded-xl bg-muted/30">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Nenhum agendamento neste dia
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-primary/30 rounded-xl bg-muted/30">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Clique em um dia no calendário para ver os agendamentos
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
