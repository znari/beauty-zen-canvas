import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, User, Phone, Calendar, MessageCircle, FileText, Clock, Plus, X, AlertCircle, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { gerarLinkWhatsApp, generateAnamnesisLink, type MessageType } from "@/lib/whatsapp";
import TemplateSelector from "@/components/TemplateSelector";
import { mockTemplates, type MessageTemplate } from "@/lib/mockTemplates";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useUpdateVisit } from "@/hooks/useUpdateVisit";
import { useCancelVisit } from "@/hooks/useCancelVisit";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatLocalDate } from "@/lib/dateUtils";
import { VisitPhotoGallery } from "@/components/VisitPhotoGallery";
import { VisitPhotoUpload } from "@/components/VisitPhotoUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const ClientProfile = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: client,
    isLoading,
    error
  } = useClientProfile(id || "");
  const updateVisit = useUpdateVisit();
  const cancelVisit = useCancelVisit();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [templateType, setTemplateType] = useState<MessageType>("BoasVindas");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedVisitForUpload, setSelectedVisitForUpload] = useState<any>(null);
  const handleOpenTemplateSelector = (type: MessageType) => {
    setTemplateType(type);
    setTemplateSelectorOpen(true);
  };
  const handleSendWithTemplate = (template: MessageTemplate) => {
    if (!client) return;
    const fichaUrl = templateType === "EnvioFicha" ? generateAnamnesisLink(client.id) : undefined;
    let message = template.conteudo;
    message = message.replace(/\[nomeCliente\]/g, client.name);
    message = message.replace(/\[nomeStudio\]/g, "FichaZen");
    if (fichaUrl) {
      message = message.replace(/\[linkFicha\]/g, fichaUrl);
    }
    const whatsappUrl = gerarLinkWhatsApp(client.phone, message);
    window.open(whatsappUrl, "_blank");
    toast({
      title: "WhatsApp aberto",
      description: `Mensagem "${template.nome}" enviada.`
    });
  };
  const handleReschedule = async () => {
    if (!newDate || !newTime || !selectedVisit) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha a nova data e horário.",
        variant: "destructive"
      });
      return;
    }
    try {
      await updateVisit.mutateAsync({
        visitId: selectedVisit.id,
        visit_date: newDate,
        visit_time: newTime
      });
      toast({
        title: "Visita reagendada",
        description: `Visita reagendada para ${formatLocalDate(newDate, "dd/MM/yyyy")} às ${newTime}.`
      });
      setRescheduleDialogOpen(false);
      setSelectedVisit(null);
      setNewDate("");
      setNewTime("");
    } catch (error: any) {
      toast({
        title: "Erro ao reagendar",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleCancelVisit = async () => {
    if (!selectedVisit) return;
    try {
      await cancelVisit.mutateAsync(selectedVisit.id);
      toast({
        title: "Visita cancelada",
        description: "A visita foi cancelada com sucesso.",
        variant: "destructive"
      });
      setCancelDialogOpen(false);
      setSelectedVisit(null);
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const openRescheduleDialog = (visit: any) => {
    setSelectedVisit(visit);
    setRescheduleDialogOpen(true);
  };
  const openCancelDialog = (visit: any) => {
    setSelectedVisit(visit);
    setCancelDialogOpen(true);
  };
  const openDetailsDialog = (visit: any) => {
    setSelectedVisit(visit);
    setDetailsDialogOpen(true);
  };
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Realtime updates para visitas
  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel('client-visits-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'visits',
      filter: `client_id=eq.${id}`
    }, () => {
      queryClient.invalidateQueries({
        queryKey: ["client-profile", id]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);
  if (isLoading) {
    return <LoadingSpinner message="Carregando perfil do cliente..." />;
  }
  if (error || !client) {
    return <div className="min-h-screen gradient-hero p-8">
        <ErrorMessage message="Cliente não encontrado ou você não tem permissão para visualizá-lo." />
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          Voltar ao Dashboard
        </Button>
      </div>;
  }
  return <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="hover:bg-primary-light">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-primary-dark">Perfil do Cliente</h1>
              <p className="text-sm text-muted-foreground">Visualize e gerencie informações do cliente</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Card */}
            <Card className="shadow-card animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarFallback className="bg-gradient-primary text-white text-2xl font-semibold">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-primary-dark">{client.name}</h2>
                    <Badge variant={client.status === "Ativa" ? "active" : "pending"} className="mt-2">
                      {client.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <Phone className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground uppercase">WhatsApp</Label>
                      <p className="font-semibold">{client.phone}</p>
                    </div>
                  </div>

                  <Button onClick={() => handleOpenTemplateSelector("BoasVindas")} className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                    Enviar Mensagem
                  </Button>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground uppercase">Cadastro</Label>
                      <p className="font-semibold">{client.registrationDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground uppercase">Última Visita</Label>
                      <p className="font-semibold">{client.lastVisit}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anamnesis Card */}
            <Card className="shadow-card animate-fade-in" style={{
            animationDelay: "0.1s"
          }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-dark">
                  <FileText className="h-5 w-5" />
                  Ficha de Anamnese
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Status</Label>
                    <div className="mt-1">
                      <Badge variant={client.anamnesisStatus === "Preenchida" ? "active" : "pending"}>
                        {client.anamnesisStatus}
                      </Badge>
                    </div>
                    {client.anamnesisDate && <p className="text-xs text-muted-foreground mt-1">
                        Preenchida em: {client.anamnesisDate}
                      </p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={() => navigate(`/cliente/${id}/ficha`)} variant="default" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    {client.anamnesisStatus === "Preenchida" ? "Ver / Editar Ficha" : "Preencher Ficha de Anamnese"}
                  </Button>
                  <Button onClick={() => handleOpenTemplateSelector("EnvioFicha")} variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                    Enviar por WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Visit History */}
          <div className="lg:col-span-2">
            <Card className="shadow-card animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary-dark">
                    <Calendar className="h-5 w-5" />
                    Histórico de Visitas
                  </CardTitle>
                  <div className="flex gap-2">
                    {client.visits.some(visit => visit.status === "Agendado") && <Button onClick={() => {
                    const nextVisit = client.visits.find(v => v.status === "Agendado");
                    if (nextVisit) openRescheduleDialog(nextVisit);
                  }} variant="outline" className="border-primary hover:bg-primary/10">Reagendar Visita<Calendar className="h-4 w-4 mr-2" />
                        Reagendar Próxima
                      </Button>}
                <Button onClick={() => navigate(`/cliente/${id}/nova-visita`)} variant="cta">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Visita
                </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {client.visits.length > 0 ? <div className="rounded-xl border border-primary/20 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-accent/30 hover:bg-accent/30">
                          <TableHead className="font-bold text-secondary">Data</TableHead>
                          <TableHead className="font-bold text-secondary">Horário</TableHead>
                          <TableHead className="font-bold text-secondary">Procedimentos</TableHead>
                          <TableHead className="font-bold text-secondary">Valor</TableHead>
                          <TableHead className="font-bold text-secondary">Status</TableHead>
                          <TableHead className="font-bold text-secondary text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {client.visits.map((visit, idx) => <TableRow key={visit.id} className={`hover:bg-muted/50 transition-all ${idx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                            <TableCell className="font-semibold">{visit.date}</TableCell>
                            <TableCell>{visit.time}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                {visit.procedures.slice(0, 2).join(", ")}
                                {visit.procedures.length > 2 && <span className="text-muted-foreground"> +{visit.procedures.length - 2}</span>}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-success-foreground">
                              R$ {visit.totalValue.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={visit.status === "Realizado" ? "active" : "pending"}>
                                {visit.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => {
                            setSelectedVisitForUpload(visit);
                            setUploadDialogOpen(true);
                          }} title="Adicionar fotos">
                                  <Camera className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => openDetailsDialog(visit)}>
                                  Ver detalhes
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openRescheduleDialog(visit)}>
                                  Reagendar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => openCancelDialog(visit)}>
                                  Cancelar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div> : <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">Nenhuma visita registrada ainda.</p>
                    <Button onClick={() => navigate(`/clientes/novo?cliente=${id}`)} variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Visita
                    </Button>
                  </div>}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm py-6 mt-8">
          <p className="text-secondary/70 font-medium">© 2025 FichaZen — Seu estúdio, mais zen 💆‍♀️✨</p>
        </footer>
      </main>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Detalhes da Visita</DialogTitle>
          </DialogHeader>
          {selectedVisit && <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Data</Label>
                  <p className="font-semibold text-lg">{selectedVisit.date}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Horário</Label>
                  <p className="font-semibold text-lg">{selectedVisit.time}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Procedimentos</Label>
                <div className="mt-2 space-y-1">
                  {selectedVisit.procedures.map((proc: string, idx: number) => <div key={idx} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="font-medium">{proc}</p>
                    </div>)}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Valor Total</Label>
                <p className="font-bold text-2xl text-success-foreground">
                  R$ {selectedVisit.totalValue.toFixed(2)}
                </p>
              </div>
              {selectedVisit.notes && <div>
                  <Label className="text-xs text-muted-foreground uppercase">Notas</Label>
                  <p className="mt-1 p-3 bg-muted/30 rounded-lg">{selectedVisit.notes}</p>
                </div>}

              {/* Galeria de Fotos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-muted-foreground uppercase">Fotos do Procedimento</Label>
                  <Button size="sm" variant="outline" onClick={() => {
                setSelectedVisitForUpload(selectedVisit);
                setUploadDialogOpen(true);
              }}>
                    <Camera className="h-4 w-4 mr-2" />
                    Adicionar Fotos
                  </Button>
                </div>
                
                <VisitPhotoGallery visitId={selectedVisit.id} photos={selectedVisit.photos || []} editable={true} />
              </div>
            </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Photos Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Upload de Fotos
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Adicione fotos antes e depois do procedimento
            </DialogDescription>
          </DialogHeader>
          
          {selectedVisitForUpload && <VisitPhotoUpload visitId={selectedVisitForUpload.id} onUploadComplete={() => {
          setUploadDialogOpen(false);
          // Refresh selected visit data
          if (selectedVisit?.id === selectedVisitForUpload.id) {
            queryClient.invalidateQueries({
              queryKey: ["client-profile"]
            });
          }
        }} />}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="bg-white border-primary/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Reagendar Visita</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Escolha uma nova data e horário para a visita
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-date" className="text-secondary font-semibold">
                Nova Data
              </Label>
              <Input id="new-date" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="new-time" className="text-secondary font-semibold">
                Novo Horário
              </Label>
              <Input id="new-time" type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReschedule} variant="cta">
              Confirmar Reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-white border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-destructive">
              Cancelar Visita?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja cancelar esta visita? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelVisit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Selector */}
      <TemplateSelector open={templateSelectorOpen} onOpenChange={setTemplateSelectorOpen} tipo={templateType} templates={mockTemplates} onSelect={handleSendWithTemplate} clientData={{
      nomeCliente: client.name
    }} />
    </div>;
};
export default ClientProfile;