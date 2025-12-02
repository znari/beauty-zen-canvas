import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const origem = searchParams.get("origem");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const origem = searchParams.get("origem");
    
    // Se origem é cadastro, redirecionar para onboarding
    if (origem === "cadastro") {
      const timer = setTimeout(() => {
        navigate("/onboarding");
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Para outras origens, comportamento normal com countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, searchParams]);

  const getMessage = () => {
    switch (origem) {
      case "ficha":
        return {
          title: "Tudo certo por aqui!",
          subtitle: "Sua ficha foi enviada com sucesso 💜",
          description: "Agradecemos pela confiança no FichaZen. Agora é só relaxar e deixar o resto com a gente ✨"
        };
      case "senha":
        return {
          title: "Tudo certo por aqui!",
          subtitle: "Sua senha foi redefinida com sucesso 💜",
          description: "Agradecemos pela confiança no FichaZen. Agora você já pode acessar sua conta com a nova senha ✨"
        };
      case "cadastro":
        return {
          title: "E-mail confirmado! 🎉",
          subtitle: "Sua conta foi ativada com sucesso 💜",
          description: "Vamos configurar seu FichaZen em poucos passos..."
        };
      default:
        return {
          title: "Tudo certo por aqui!",
          subtitle: "Ação realizada com sucesso 💜",
          description: "Agradecemos pela confiança no FichaZen. Agora é só relaxar e deixar o resto com a gente ✨"
        };
    }
  };

  const message = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-light/30 via-white to-accent-light/30">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary-dark">
              {message.title}
            </h1>
            <p className="text-lg text-primary">
              {message.subtitle}
            </p>
          </div>

          <p className="text-muted-foreground">
            {message.description}
          </p>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
              size="lg"
            >
              Voltar ao Início
            </Button>
            
            {origem === "ficha" && (
              <Button 
                onClick={() => navigate("/ficha/novo")} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Preencher nova ficha
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Redirecionando automaticamente em {countdown}s...
          </p>
        </div>

        <footer className="text-center mt-8 text-sm text-primary/70">
          © 2025 FichaZen — Seu estúdio, mais zen 🌷
        </footer>
      </div>
    </div>
  );
};

export default Success;
