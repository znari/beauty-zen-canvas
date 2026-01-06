import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, Sparkles, ArrowLeft, Loader2, MapPin, Phone, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePublicBookingSettings, WorkingHours } from "@/hooks/usePublicBookingSettings";
import { usePublicProcedures } from "@/hooks/usePublicProcedures";
import { usePublicTeamMembers } from "@/hooks/usePublicTeamMembers";
import { usePublicAvailableSlots } from "@/hooks/usePublicAvailableSlots";
import { useCreateBookingRequest } from "@/hooks/useCreateBookingRequest";
import { usePublicAvatarUrl } from "@/hooks/usePublicAvatarUrl";
import { toast } from "sonner";
import { addDays, isBefore, startOfDay, isAfter } from "date-fns";

const DAY_MAP: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const formatWhatsAppLink = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  const withCountry = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  return `https://wa.me/${withCountry}`;
};

const PublicBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Form state
  const [step, setStep] = useState(1);
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Data fetching
  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = usePublicBookingSettings(slug || "");
  const { data: procedures, isLoading: isLoadingProcedures } = usePublicProcedures(settings?.professional_id);
  const { data: teamMembers, isLoading: isLoadingTeam } = usePublicTeamMembers(settings?.professional_id);
  const { data: availableSlots, isLoading: isLoadingSlots } = usePublicAvailableSlots(
    settings?.professional_id,
    selectedDate,
    selectedProfessional || undefined,
    settings?.working_hours,
    settings?.slot_duration_minutes || 60,
    settings?.min_advance_hours || 24
  );

  const { avatarUrl } = usePublicAvatarUrl(settings?.avatar_url);
  const createBookingRequest = useCreateBookingRequest();

  const isDateDisabled = (date: Date): boolean => {
    if (!settings) return true;

    const today = startOfDay(new Date());
    const maxDate = addDays(today, settings.max_advance_days);

    // Past dates
    if (isBefore(date, today)) return true;

    // Beyond max advance days
    if (isAfter(date, maxDate)) return true;

    // Blocked dates
    const dateStr = format(date, "yyyy-MM-dd");
    if (settings.blocked_dates.includes(dateStr)) return true;

    // Non-working days
    const dayOfWeek = date.getDay();
    const dayKey = DAY_MAP[dayOfWeek];
    const dayHours = settings.working_hours[dayKey];
    if (!dayHours || !dayHours.enabled) return true;

    return false;
  };

  const handleSubmit = async () => {
    if (!settings || !selectedProcedure || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const result = await createBookingRequest.mutateAsync({
        professional_id: settings.professional_id,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail || undefined,
        procedure_id: selectedProcedure,
        assigned_professional_id: selectedProfessional || undefined,
        requested_date: format(selectedDate, "yyyy-MM-dd"),
        requested_time: selectedTime,
        notes: notes || undefined,
      });

      navigate("/agendar/sucesso", {
        state: {
          studioName: settings.studio_name,
          avatarUrl: settings.avatar_url,
          date: format(selectedDate, "dd 'de' MMMM", { locale: ptBR }),
          time: selectedTime,
          isAutoApproved: result.isAutoApproved,
        },
      });
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    }
  };

  const goBack = () => {
    if (step > 1) {
      if (step === 2) {
        setSelectedProfessional(null);
      } else if (step === 3) {
        setSelectedDate(undefined);
        setSelectedTime(null);
      }
      setStep(step - 1);
    }
  };

  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-alt">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found state
  if (settingsError || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-alt p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Agenda não encontrada</h1>
            <p className="text-muted-foreground">
              Este link de agendamento não existe ou foi removido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Disabled state - agenda exists but is not enabled
  if (!settings.is_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-alt p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            {/* Avatar */}
            <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-primary/20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={settings.studio_name} />
              ) : null}
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {settings.studio_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-2xl font-bold text-foreground mb-2">{settings.studio_name}</h1>
            
            <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto my-4">
              <PauseCircle className="h-6 w-6 text-warning" />
            </div>
            
            <h2 className="text-lg font-medium text-foreground mb-2">
              Agendamentos temporariamente indisponíveis
            </h2>
            <p className="text-muted-foreground mb-6">
              Esta agenda não está aceitando novos agendamentos no momento.
              Por favor, entre em contato diretamente com o profissional.
            </p>

            {settings.phone && (
              <Button asChild className="w-full">
                <a href={formatWhatsAppLink(settings.phone)} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-4 w-4 mr-2" />
                  Falar pelo WhatsApp
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedProcedureData = procedures?.find(p => p.id === selectedProcedure);
  const selectedProfessionalData = teamMembers?.find(t => t.id === selectedProfessional);
  const hasLocation = settings.address_city || settings.address_state;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-alt py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-primary/20 shadow-lg">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={settings.studio_name} />
            ) : null}
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {settings.studio_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {settings.studio_name}
          </h1>
          
          {/* Location */}
          {hasLocation && (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-2">
              <MapPin className="h-3.5 w-3.5" />
              {[settings.address_city, settings.address_state].filter(Boolean).join(", ")}
            </p>
          )}

          {/* Welcome message */}
          {settings.welcome_message && (
            <p className="text-muted-foreground italic">&ldquo;{settings.welcome_message}&rdquo;</p>
          )}

          {/* WhatsApp contact */}
          {settings.phone && (
            <a
              href={formatWhatsAppLink(settings.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              Fale conosco pelo WhatsApp
            </a>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/50" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Back button */}
        {step > 1 && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}

        {/* Step 1: Select Procedure */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Escolha o procedimento
              </CardTitle>
              <CardDescription>Selecione o serviço que deseja agendar</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProcedures ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : procedures && procedures.length > 0 ? (
                <div className="grid gap-3">
                  {procedures.map((procedure) => (
                    <button
                      key={procedure.id}
                      onClick={() => {
                        setSelectedProcedure(procedure.id);
                        setStep(teamMembers && teamMembers.length > 1 ? 2 : 3);
                        if (teamMembers && teamMembers.length === 1) {
                          setSelectedProfessional(teamMembers[0].id);
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                        selectedProcedure === procedure.id
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{procedure.name}</h3>
                          {procedure.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {procedure.description}
                            </p>
                          )}
                        </div>
                        {procedure.price > 0 && (
                          <span className="text-primary font-semibold whitespace-nowrap">
                            R$ {procedure.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum procedimento disponível
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Professional (if multiple) */}
        {step === 2 && teamMembers && teamMembers.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Escolha o profissional
              </CardTitle>
              <CardDescription>Selecione quem irá realizar o atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTeam ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedProfessional(member.id);
                        setStep(3);
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                        selectedProfessional === member.id
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      <h3 className="font-medium text-foreground">{member.name}</h3>
                      {member.specialty && (
                        <p className="text-sm text-muted-foreground">{member.specialty}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Date and Time */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Escolha data e horário
              </CardTitle>
              <CardDescription>Selecione quando deseja ser atendido(a)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Calendar */}
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    disabled={isDateDisabled}
                    locale={ptBR}
                    className="rounded-xl border"
                  />
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Horários disponíveis
                    </h4>
                    {isLoadingSlots ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : availableSlots && availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg border-2 text-center transition-all hover:border-primary hover:bg-primary/5 ${
                              selectedTime === time
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border text-foreground"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum horário disponível nesta data
                      </p>
                    )}
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <Button onClick={() => setStep(4)} className="w-full">
                    Continuar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Client Info */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Seus dados
              </CardTitle>
              <CardDescription>Preencha suas informações para confirmar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Procedimento:</span>
                    <span className="font-medium">{selectedProcedureData?.name}</span>
                  </div>
                  {selectedProfessionalData && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Profissional:</span>
                      <span className="font-medium">{selectedProfessionalData.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Digite seu nome"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Alguma informação adicional..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!clientName || !clientPhone || createBookingRequest.isPending}
                  className="w-full"
                >
                  {createBookingRequest.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Confirmar solicitação"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Sua solicitação será analisada e você receberá a confirmação em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
