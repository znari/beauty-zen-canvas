import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, FileText, Settings, Search, Plus, MessageSquare, User, Clipboard, HelpCircle, LifeBuoy, LogOut, Clock, Scissors, Mail, MessageCircle } from "lucide-react";
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

// Mock data
const kpiData = [
  { icon: Users, label: "Total de Clientes", value: 47 },
  { icon: FileText, label: "Fichas Pendentes", value: 12 },
  { icon: Calendar, label: "Visitas da Semana", value: 23 },
];

const mockWeekDays = [
  { day: "Segunda", date: "04/11" },
  { day: "Terça", date: "05/11" },
  { day: "Quarta", date: "06/11" },
  { day: "Quinta", date: "07/11" },
  { day: "Sexta", date: "08/11" },
  { day: "Sábado", date: "09/11" },
];

const mockAppointments = {
  "04/11": [
    { id: 1, time: "09:00", client: "Maria Silva", procedure: "Design de Sobrancelhas", notes: "Primeira sessão" },
    { id: 2, time: "14:00", client: "Ana Costa", procedure: "Lash Lifting", notes: "Cliente regular" },
  ],
  "05/11": [
    { id: 3, time: "10:00", client: "Juliana Santos", procedure: "Micropigmentação", notes: "Retoque após 30 dias" },
    { id: 4, time: "15:30", client: "Carla Oliveira", procedure: "Henna", notes: "" },
  ],
  "06/11": [
    { id: 5, time: "11:00", client: "Patrícia Lima", procedure: "Design de Sobrancelhas", notes: "" },
  ],
  "07/11": [],
  "08/11": [
    { id: 6, time: "09:30", client: "Fernanda Rocha", procedure: "Lash Lifting", notes: "Preferência por curvatura C" },
    { id: 7, time: "13:00", client: "Beatriz Alves", procedure: "Micropigmentação", notes: "Primeira sessão - agendar retoque" },
  ],
  "09/11": [
    { id: 8, time: "10:00", client: "Roberta Souza", procedure: "Design de Sobrancelhas", notes: "" },
    { id: 9, time: "14:00", client: "Luciana Martins", procedure: "Henna", notes: "" },
  ],
};

const mockClients = [
  { id: 1, name: "Maria Silva", phone: "(11) 98765-4321", status: "Ativa", lastActivity: "03/11/2025" },
  { id: 2, name: "Ana Costa", phone: "(11) 97654-3210", status: "Ativa", lastActivity: "02/11/2025" },
  { id: 3, name: "Juliana Santos", phone: "(11) 96543-2109", status: "Pendente", lastActivity: "01/11/2025" },
  { id: 4, name: "Carla Oliveira", phone: "(11) 95432-1098", status: "Ativa", lastActivity: "31/10/2025" },
  { id: 5, name: "Patrícia Lima", phone: "(11) 94321-0987", status: "Ativa", lastActivity: "30/10/2025" },
];

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
    navigate("/login");
  };

  const handleCancelAppointment = () => {
    toast({
      title: "Agendamento cancelado",
      description: "O agendamento foi cancelado com sucesso.",
    });
    setSelectedAppointment(null);
  };

  const handleReschedule = () => {
    toast({
      title: "Reagendamento",
      description: "Funcionalidade de reagendamento em desenvolvimento.",
    });
    setSelectedAppointment(null);
  };

  const handleNewClient = () => {
    toast({
      title: "Cliente cadastrado",
      description: "Novo cliente adicionado com sucesso!",
    });
    setShowNewClientDialog(false);
  };

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

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
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Calendário de Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockWeekDays.map((day) => (
                <div key={day.date} className="space-y-3">
                  <div className="text-center p-3 bg-primary text-white rounded-xl shadow-sm">
                    <div className="font-semibold text-base">{day.day}</div>
                    <div className="text-sm opacity-90">{day.date}</div>
                  </div>
                  <div className="space-y-2">
                    {mockAppointments[day.date as keyof typeof mockAppointments].length > 0 ? (
                      mockAppointments[day.date as keyof typeof mockAppointments].map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className="w-full p-3 bg-white border border-primary/20 hover:bg-accent/30 rounded-xl text-left transition-all hover:scale-[1.02] hover:shadow-md"
                        >
                          <div className="text-xs font-bold text-secondary flex items-center gap-1">
                            <span>🕓</span> {apt.time}
                          </div>
                          <div className="text-sm font-semibold text-foreground mt-1">{apt.client}</div>
                        </button>
                      ))
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
                  {mockClients.slice(0, 5).map((client, idx) => (
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
                          variant={client.status === "Ativa" ? "active" : "pending"}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.lastActivity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {mockClients.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  onClick={() => navigate("/clientes")}
                  variant="ghost"
                  className="text-primary hover:text-primary-dark"
                >
                  Ver todos os {mockClients.length} clientes →
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
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Detalhes do Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações completas sobre este agendamento
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="p-3 bg-accent rounded-full flex-shrink-0">
                  <User className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-bold text-secondary uppercase tracking-wide">Cliente</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">{selectedAppointment.client}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-bold text-secondary uppercase tracking-wide">Procedimento</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">{selectedAppointment.procedure}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="p-3 bg-accent rounded-full flex-shrink-0">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-bold text-secondary uppercase tracking-wide">Horário</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">{selectedAppointment.time}</p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-bold text-secondary uppercase tracking-wide">Observações</Label>
                    <p className="text-lg text-foreground mt-1">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleReschedule} className="border-primary/30 hover:bg-primary/10">
              Reagendar
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment} className="shadow-md">
              Cancelar Agendamento
            </Button>
          </DialogFooter>
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
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  placeholder="Digite o nome do cliente" 
                  className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10" 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-secondary font-semibold">WhatsApp</Label>
              <div className="relative mt-1">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  placeholder="(11) 98765-4321" 
                  className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10" 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-secondary font-semibold">E-mail</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="cliente@exemplo.com" 
                  className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10" 
                />
              </div>
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
    </div>
  );
};

export default Dashboard;
