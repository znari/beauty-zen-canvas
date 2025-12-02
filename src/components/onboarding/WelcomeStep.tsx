import { useEffect } from "react";
import { Sparkles, Calendar, MessageCircle, Camera, TrendingUp, Bell } from "lucide-react";

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  useEffect(() => {
    // Step 1 is always ready to proceed
    onContinue();
  }, [onContinue]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-4">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Seu estúdio de beleza agora tem um sistema completo de gestão! 💅✨
        </p>
      </div>

      <div className="bg-primary-light/30 rounded-xl p-6 border border-primary/20">
        <h3 className="font-semibold text-primary-dark mb-4 text-center">
          Em poucos minutos você vai:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-primary-dark">Configurar seu estúdio</h4>
              <p className="text-xs text-muted-foreground mt-1">Nome e contato do seu negócio</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-primary-dark">Cadastrar procedimentos</h4>
              <p className="text-xs text-muted-foreground mt-1">Serviços que você oferece</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-primary-dark">Adicionar primeiro cliente</h4>
              <p className="text-xs text-muted-foreground mt-1">Comece a organizar sua agenda</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-primary-dark">Personalizar mensagens</h4>
              <p className="text-xs text-muted-foreground mt-1">Templates de WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 text-center">
          ⏱️ <strong>Tempo estimado:</strong> 5 minutos
        </p>
      </div>
    </div>
  );
}
