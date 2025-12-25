import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LocationState {
  studioName: string;
  date: string;
  time: string;
}

const PublicBookingSuccess = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-alt flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-success-foreground" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Solicitação enviada!
          </h1>

          <p className="text-muted-foreground mb-6">
            Sua solicitação de agendamento foi enviada com sucesso e será analisada em breve.
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
              📱 Você receberá uma mensagem no WhatsApp assim que o agendamento for confirmado.
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
