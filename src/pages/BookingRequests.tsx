import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  MessageCircle,
  Eye,
  Loader2,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookingRequests, BookingRequest } from "@/hooks/useBookingRequests";
import { useApproveBookingRequest } from "@/hooks/useApproveBookingRequest";
import { useRejectBookingRequest } from "@/hooks/useRejectBookingRequest";
import { RejectBookingModal } from "@/components/booking/RejectBookingModal";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";

export default function BookingRequests() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);

  const { data: requests = [], isLoading } = useBookingRequests(statusFilter);
  const approveMutation = useApproveBookingRequest();
  const rejectMutation = useRejectBookingRequest();

  const handleApprove = (request: BookingRequest) => {
    approveMutation.mutate({
      requestId: request.id,
      clientName: request.client_name,
      clientPhone: request.client_phone,
      clientEmail: request.client_email,
      procedureId: request.procedure_id,
      procedureName: request.procedure_name,
      requestedDate: request.requested_date,
      requestedTime: request.requested_time,
      assignedProfessionalId: request.assigned_professional_id,
      notes: request.notes,
    });
  };

  const handleRejectClick = (request: BookingRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedRequest) {
      rejectMutation.mutate(
        { requestId: selectedRequest.id, reason },
        {
          onSuccess: () => {
            setRejectModalOpen(false);
            setSelectedRequest(null);
          },
        }
      );
    }
  };

  const handleWhatsApp = (request: BookingRequest) => {
    const formattedDate = format(parseISO(request.requested_date), "dd/MM", { locale: ptBR });
    const formattedTime = request.requested_time.slice(0, 5);
    const message = `Olá ${request.client_name}! Recebemos sua solicitação de agendamento para ${request.procedure_name} no dia ${formattedDate} às ${formattedTime}. Em breve retornaremos com a confirmação!`;
    const link = gerarLinkWhatsApp(request.client_phone, message);
    window.open(link, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Aprovada</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const formattedDate = format(parseISO(date), "dd 'de' MMMM", { locale: ptBR });
    const formattedTime = time.slice(0, 5);
    return `${formattedDate} às ${formattedTime}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Solicitações de Agendamento</h1>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovadas</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">Nenhuma solicitação</h3>
              <p className="text-muted-foreground text-sm">
                {statusFilter === "all"
                  ? "Você ainda não recebeu solicitações de agendamento."
                  : `Não há solicitações com status "${statusFilter === "pending" ? "pendente" : statusFilter === "approved" ? "aprovada" : "rejeitada"}".`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{request.client_name}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.procedure_name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(parseISO(request.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatDateTime(request.requested_date, request.requested_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{request.client_phone}</span>
                    </div>
                    {request.client_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span>{request.client_email}</span>
                      </div>
                    )}
                    {request.assigned_professional_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4 shrink-0" />
                        <span>Profissional: {request.assigned_professional_name}</span>
                      </div>
                    )}
                    {request.notes && (
                      <p className="text-muted-foreground bg-muted/50 rounded-md p-2 mt-1">
                        {request.notes}
                      </p>
                    )}
                  </div>

                  {request.status === "rejected" && request.rejection_reason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                      <p className="text-sm text-red-600">
                        <strong>Motivo:</strong> {request.rejection_reason}
                      </p>
                    </div>
                  )}

                  {request.status === "approved" && request.reviewed_at && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3">
                      <p className="text-sm text-green-600">
                        Aprovada em {format(parseISO(request.reviewed_at), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          disabled={approveMutation.isPending}
                          className="flex-1 sm:flex-none"
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectClick(request)}
                          disabled={rejectMutation.isPending}
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleWhatsApp(request)}
                          className="flex-1 sm:flex-none"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </>
                    )}

                    {request.status === "approved" && request.converted_client_id && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/clientes/${request.converted_client_id}`)}
                          className="flex-1 sm:flex-none"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Cliente
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleWhatsApp(request)}
                          className="flex-1 sm:flex-none"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </>
                    )}

                    {request.status === "rejected" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleWhatsApp(request)}
                        className="flex-1 sm:flex-none"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <RejectBookingModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onConfirm={handleRejectConfirm}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
