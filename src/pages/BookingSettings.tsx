import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Copy, ExternalLink, Link2, Clock, CalendarDays, Settings2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useBookingSettings, defaultWorkingHours, WorkingHours } from "@/hooks/useBookingSettings";
import { useSaveBookingSettings } from "@/hooks/useSaveBookingSettings";
import { WorkingHoursRow } from "@/components/booking/WorkingHoursRow";
import { BlockedDatesSelector } from "@/components/booking/BlockedDatesSelector";

const dayLabels: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const BookingSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settings, isLoading } = useBookingSettings();
  const saveSettings = useSaveBookingSettings();

  // Form state
  const [isEnabled, setIsEnabled] = useState(true);
  const [slug, setSlug] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [minAdvanceHours, setMinAdvanceHours] = useState(24);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [slotDuration, setSlotDuration] = useState(60);
  const [requireApproval, setRequireApproval] = useState(true);
  const [workingHours, setWorkingHours] = useState<Record<string, WorkingHours>>(defaultWorkingHours);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Load existing settings
  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.is_enabled);
      setSlug(settings.booking_slug || "");
      setWelcomeMessage(settings.welcome_message || "");
      setMinAdvanceHours(settings.min_advance_hours);
      setMaxAdvanceDays(settings.max_advance_days);
      setSlotDuration(settings.slot_duration_minutes);
      setRequireApproval(settings.require_approval);
      setWorkingHours(settings.working_hours);
      setBlockedDates(settings.blocked_dates);
    }
  }, [settings]);

  const handleSlugChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(sanitized);
  };

  const handleSave = async () => {
    // Validate slug
    if (isEnabled && (!slug || slug.length < 3)) {
      toast({
        title: "Link inválido",
        description: "O link deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Validate working hours
    for (const day of daysOrder) {
      const hours = workingHours[day];
      if (hours.enabled && hours.start >= hours.end) {
        toast({
          title: "Horário inválido",
          description: `O horário de término deve ser maior que o de início em ${dayLabels[day]}.`,
          variant: "destructive",
        });
        return;
      }
    }

    await saveSettings.mutateAsync({
      is_enabled: isEnabled,
      booking_slug: slug || null,
      welcome_message: welcomeMessage || null,
      min_advance_hours: minAdvanceHours,
      max_advance_days: maxAdvanceDays,
      slot_duration_minutes: slotDuration,
      require_approval: requireApproval,
      working_hours: workingHours,
      blocked_dates: blockedDates,
    });
  };

  const copyLink = () => {
    const fullUrl = `${window.location.origin}/agendar/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  const testLink = () => {
    window.open(`/agendar/${slug}`, "_blank");
  };

  const updateWorkingHours = (day: string, value: WorkingHours) => {
    setWorkingHours((prev) => ({ ...prev, [day]: value }));
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando configurações..." />;
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-primary">Agendamento Online</h1>
            </div>
            <Button onClick={handleSave} disabled={saveSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveSettings.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-3xl">
        {/* Status e Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Status e Link
            </CardTitle>
            <CardDescription>
              Ative o agendamento online e personalize seu link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enabled" className="text-base font-medium">
                  Ativar agendamento online
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, clientes podem solicitar agendamentos pelo link.
                </p>
              </div>
              <Switch
                id="enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Seu link personalizado</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-0">
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0">
                    {window.location.origin}/agendar/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="seu-studio"
                    className="rounded-l-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    disabled={!slug}
                    title="Copiar link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={testLink}
                    disabled={!slug}
                    title="Testar link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Use apenas letras minúsculas, números e hífens. Mínimo 3 caracteres.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Horários de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários de Funcionamento
            </CardTitle>
            <CardDescription>
              Defina os dias e horários disponíveis para agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {daysOrder.map((day) => (
                <WorkingHoursRow
                  key={day}
                  day={day}
                  label={dayLabels[day]}
                  value={workingHours[day]}
                  onChange={(value) => updateWorkingHours(day, value)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configurações Avançadas
            </CardTitle>
            <CardDescription>
              Personalize regras de antecedência e duração.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-advance">Antecedência mínima</Label>
                <Select
                  value={minAdvanceHours.toString()}
                  onValueChange={(v) => setMinAdvanceHours(Number(v))}
                >
                  <SelectTrigger id="min-advance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="6">6 horas</SelectItem>
                    <SelectItem value="12">12 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="48">48 horas</SelectItem>
                    <SelectItem value="72">72 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-advance">Máximo de dias no futuro</Label>
                <Select
                  value={maxAdvanceDays.toString()}
                  onValueChange={(v) => setMaxAdvanceDays(Number(v))}
                >
                  <SelectTrigger id="max-advance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot-duration">Duração padrão dos slots</Label>
              <Select
                value={slotDuration.toString()}
                onValueChange={(v) => setSlotDuration(Number(v))}
              >
                <SelectTrigger id="slot-duration" className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="require-approval" className="text-base font-medium">
                  Exigir aprovação manual
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, você precisará aprovar cada solicitação.
                </p>
              </div>
              <Switch
                id="require-approval"
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
              />
            </div>
          </CardContent>
        </Card>

        {/* Datas Bloqueadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Datas Bloqueadas
            </CardTitle>
            <CardDescription>
              Bloqueie datas específicas como feriados, férias ou dias de folga.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlockedDatesSelector
              blockedDates={blockedDates}
              onChange={setBlockedDates}
            />
          </CardContent>
        </Card>

        {/* Mensagem de Boas-vindas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagem de Boas-vindas
            </CardTitle>
            <CardDescription>
              Texto exibido na página de agendamento para seus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Ex: Olá! Que bom ter você aqui. Escolha o melhor horário para o seu atendimento."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookingSettings;
