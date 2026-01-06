import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Calendar, Clock, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePublicAvatarUrl } from "@/hooks/usePublicAvatarUrl";

interface LocationState {
  studioName: string;
  avatarUrl?: string | null;
  date: string;
  time: string;
  isAutoApproved?: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const PublicBookingSuccess = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const isAutoApproved = state?.isAutoApproved ?? false;
  
  const { avatarUrl: signedAvatarUrl } = usePublicAvatarUrl(state?.avatarUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-alt flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Logo/Avatar do estúdio */}
          {state?.avatarUrl ? (
            <Avatar className="w-20 h-20 mx-auto mb-6 border-4 border-primary/20">
              <AvatarImage src={signedAvatarUrl || undefined} alt={state?.studioName} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {state?.studioName ? getInitials(state.studioName) : "?"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isAutoApproved ? "bg-success/20" : "bg-primary/20"
            }`}>
              {isAutoApproved ? (
                <CheckCircle className="h-10 w-10 text-success-foreground" />
              ) : (
                <Sparkles className="h-10 w-10 text-primary" />
              )}
            </div>
          )}

          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isAutoApproved ? "Agendamento confirmado!" : "Solicitação enviada!"}
          </h1>

          <p className="text-muted-foreground mb-6">
            {isAutoApproved 
              ? "Seu agendamento foi confirmado automaticamente. Aguardamos você!"
              : "Sua solicitação de agendamento foi enviada com sucesso e será analisada em breve."
            }
          </p>

          {state && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-3">
              <h3 className="font-medium text-foreground">{state.studioName}</h3>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {state.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {state.time}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isAutoApproved 
                ? "📱 Você pode salvar essas informações ou aguardar nosso contato via WhatsApp."
                : "📱 Você receberá uma mensagem no WhatsApp assim que o agendamento for confirmado."
              }
            </p>

            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicBookingSuccess;
