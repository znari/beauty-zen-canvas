import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Phone,
  Calendar,
  MessageCircle,
  Edit,
  Image as ImageIcon,
  FileText,
  Clock,
  DollarSign,
  ChevronLeft,
  X,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Mock data - substituir com dados reais do backend
const mockClientData = {
  1: {
    id: 1,
    name: "Maria Silva",
    phone: "(11) 98765-4321",
    email: "maria.silva@email.com",
    registrationDate: "15/08/2024",
    lastAppointment: "03/11/2025",
    status: "Ativa",
    anamnesisStatus: "Preenchida",
    anamnesisDate: "20/08/2024",
    appointments: [
      {
        id: 1,
        date: "03/11/2025",
        time: "09:00",
        procedure: "Design de Sobrancelhas",
        value: "R$ 120,00",
        status: "Realizado",
      },
      {
        id: 2,
        date: "20/10/2025",
        time: "14:00",
        procedure: "Micropigmentação",
        value: "R$ 450,00",
        status: "Realizado",
      },
      {
        id: 3,
        date: "15/09/2025",
        time: "10:30",
        procedure: "Henna",
        value: "R$ 80,00",
        status: "Realizado",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
      "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400",
    ],
  },
  2: {
    id: 2,
    name: "Ana Costa",
    phone: "(11) 97654-3210",
    email: "ana.costa@email.com",
    registrationDate: "10/09/2024",
    lastAppointment: "02/11/2025",
    status: "Ativa",
    anamnesisStatus: "Preenchida",
    anamnesisDate: "12/09/2024",
    appointments: [
      {
        id: 4,
        date: "02/11/2025",
        time: "14:00",
        procedure: "Lash Lifting",
        value: "R$ 180,00",
        status: "Realizado",
      },
    ],
    photos: [],
  },
};

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const client = mockClientData[Number(id) as keyof typeof mockClientData] || mockClientData[1];

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleWhatsAppMessage = () => {
    const message = encodeURIComponent("Olá! Tudo bem? 😊");
    window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const handleSaveEdit = () => {
    toast({
      title: "Cliente atualizado",
      description: "As informações do cliente foram atualizadas com sucesso.",
    });
    setEditDialogOpen(false);
  };

  const handleReschedule = () => {
    toast({
      title: "Agendamento reagendado",
      description: "O agendamento foi reagendado com sucesso.",
    });
    setRescheduleDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = () => {
    toast({
      title: "Agendamento cancelado",
      description: "O agendamento foi cancelado.",
      variant: "destructive",
    });
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleAddPhotos = () => {
    toast({
      title: "Fotos adicionadas",
      description: "As fotos foram adicionadas à galeria do cliente.",
    });
    setPhotoDialogOpen(false);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Breadcrumb Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-secondary hover:text-primary hover:bg-primary/10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
                <span>/</span>
                <User className="h-4 w-4" />
                <span className="font-semibold text-foreground">Perfil do Cliente</span>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setEditDialogOpen(true)}
              className="font-semibold"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Cliente
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-primary mt-4">{client.name}</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Informações do Cliente */}
        <Card className="bg-white shadow-card border-primary/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
              <User className="h-6 w-6" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                  <User className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Nome Completo</Label>
                    <p className="text-lg font-semibold text-foreground">{client.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">WhatsApp</Label>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-foreground">{client.phone}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleWhatsAppMessage}
                        className="ml-2"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar mensagem
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Data de Cadastro</Label>
                    <p className="text-lg font-semibold text-foreground">{client.registrationDate}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Último Agendamento</Label>
                    <p className="text-lg font-semibold text-foreground">{client.lastAppointment}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                  <FileText className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Status da Ficha</Label>
                    <div className="mt-2">
                      <Badge variant={client.status === "Ativa" ? "active" : "pending"}>
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Agendamentos */}
        <Card className="bg-white shadow-card border-primary/20 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Histórico de Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-primary/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-accent/30 hover:bg-accent/30">
                    <TableHead className="font-bold text-secondary">Data</TableHead>
                    <TableHead className="font-bold text-secondary">Horário</TableHead>
                    <TableHead className="font-bold text-secondary">Procedimento</TableHead>
                    <TableHead className="font-bold text-secondary">Valor</TableHead>
                    <TableHead className="font-bold text-secondary">Status</TableHead>
                    <TableHead className="font-bold text-secondary">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.appointments.map((appointment, idx) => (
                    <TableRow
                      key={appointment.id}
                      className={`hover:bg-muted/50 transition-all ${
                        idx % 2 === 0 ? "bg-white" : "bg-muted/20"
                      }`}
                    >
                      <TableCell className="font-semibold">{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{appointment.procedure}</TableCell>
                      <TableCell className="font-semibold text-success-foreground">
                        {appointment.value}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "Realizado"
                              ? "active"
                              : appointment.status === "Pendente"
                              ? "pending"
                              : "error"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setRescheduleDialogOpen(true);
                            }}
                          >
                            Reagendar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setCancelDialogOpen(true);
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ficha de Anamnese */}
        <Card className="bg-white shadow-card border-primary/20 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Ficha de Anamnese
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-muted/30 rounded-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase">Status:</Label>
                  <Badge variant={client.anamnesisStatus === "Preenchida" ? "active" : "pending"}>
                    {client.anamnesisStatus}
                  </Badge>
                </div>
                {client.anamnesisStatus === "Preenchida" && (
                  <p className="text-sm text-muted-foreground">
                    Preenchida em: <span className="font-semibold">{client.anamnesisDate}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="default">
                  <FileText className="h-4 w-4 mr-2" />
                  Visualizar Ficha
                </Button>
                <Button variant="outline" onClick={handleWhatsAppMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reenviar via WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Galeria */}
        <Card className="bg-white shadow-card border-primary/20 animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
                <ImageIcon className="h-6 w-6" />
                Fotos do Cliente
              </CardTitle>
              <Button onClick={() => setPhotoDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Fotos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {client.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {client.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square rounded-xl overflow-hidden shadow-card hover-lift cursor-pointer"
                  >
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma foto adicionada ainda.</p>
                <Button
                  onClick={() => setPhotoDialogOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Adicionar primeira foto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm py-6">
          <p className="text-secondary/70 font-medium">© 2025 FichaZen — Seu estúdio, mais zen 💆‍♀️✨</p>
        </footer>
      </main>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Editar Cliente</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name" className="text-secondary font-semibold">
                Nome completo
              </Label>
              <Input
                id="edit-name"
                defaultValue={client.name}
                className="border-primary/30 focus:border-primary mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone" className="text-secondary font-semibold">
                WhatsApp
              </Label>
              <Input
                id="edit-phone"
                defaultValue={client.phone}
                className="border-primary/30 focus:border-primary mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-email" className="text-secondary font-semibold">
                E-mail
              </Label>
              <Input
                id="edit-email"
                type="email"
                defaultValue={client.email}
                className="border-primary/30 focus:border-primary mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Reagendar</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Escolha uma nova data e horário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reschedule-date" className="text-secondary font-semibold">
                Nova Data
              </Label>
              <Input
                id="reschedule-date"
                type="date"
                className="border-primary/30 focus:border-primary mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reschedule-time" className="text-secondary font-semibold">
                Novo Horário
              </Label>
              <Input
                id="reschedule-time"
                type="time"
                className="border-primary/30 focus:border-primary mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReschedule}>Confirmar Reagendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive">
              Cancelar Agendamento
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Sim, Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Photos Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Adicionar Fotos</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Faça upload de fotos do cliente (antes/depois)
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-foreground font-semibold mb-2">Clique para fazer upload</p>
              <p className="text-sm text-muted-foreground">ou arraste e solte suas fotos aqui</p>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG ou WEBP (máx. 5MB)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPhotos}>Adicionar Fotos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl bg-white border-primary/20 shadow-xl p-0">
          <div className="relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white shadow-lg transition-all z-10"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt="Preview"
                className="w-full h-auto rounded-xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientProfile;
