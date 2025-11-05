import { useState } from "react";
import { Calendar, Users, FileText, Settings, Search, Plus } from "lucide-react";
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
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="min-h-screen bg-gradient-to-br from-[#FCF8FD] to-[#EFCFEF]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary">FichaZen</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Procedimentos</DropdownMenuItem>
              <DropdownMenuItem>Mensagens WhatsApp</DropdownMenuItem>
              <DropdownMenuItem>Ajuda</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border-primary/10 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{kpi.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly Calendar */}
        <Card className="bg-white/90 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Calendário de Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockWeekDays.map((day) => (
                <div key={day.date} className="space-y-2">
                  <div className="text-center p-2 bg-primary/10 rounded-lg">
                    <div className="font-semibold text-primary">{day.day}</div>
                    <div className="text-sm text-muted-foreground">{day.date}</div>
                  </div>
                  <div className="space-y-2">
                    {mockAppointments[day.date as keyof typeof mockAppointments].length > 0 ? (
                      mockAppointments[day.date as keyof typeof mockAppointments].map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className="w-full p-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-left transition-colors"
                        >
                          <div className="text-xs font-semibold text-primary">{apt.time}</div>
                          <div className="text-sm text-foreground">{apt.client}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed border-primary/20 rounded-lg">
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
        <Card className="bg-white/90 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl text-primary">Meus Clientes</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou telefone..."
                    className="pl-10 border-primary/20 focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => setShowNewClientDialog(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-primary/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead>Cliente</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Status da Ficha</TableHead>
                    <TableHead>Última Atividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-primary/5">
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={client.status === "Ativa" ? "default" : "secondary"}
                          className={
                            client.status === "Ativa"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
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
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-4">
          © 2025 FichaZen — Seu estúdio, mais zen.
        </footer>
      </main>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Informações completas sobre este agendamento
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Cliente</Label>
                <p className="text-lg">{selectedAppointment.client}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Procedimento</Label>
                <p className="text-lg">{selectedAppointment.procedure}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Horário</Label>
                <p className="text-lg">{selectedAppointment.time}</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Observações</Label>
                  <p className="text-lg">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleReschedule} className="border-primary/20">
              Reagendar
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancelar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-primary">Novo Cliente</DialogTitle>
            <DialogDescription>
              Cadastre um novo cliente no seu estúdio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" placeholder="Digite o nome do cliente" className="border-primary/20" />
            </div>
            <div>
              <Label htmlFor="phone">WhatsApp</Label>
              <Input id="phone" placeholder="(11) 98765-4321" className="border-primary/20" />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="cliente@exemplo.com" className="border-primary/20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewClientDialog(false)} className="border-primary/20">
              Cancelar
            </Button>
            <Button onClick={handleNewClient} className="bg-primary hover:bg-primary/90">
              Cadastrar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
