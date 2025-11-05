import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate authentication check
    const isValid = true; // In real implementation, check against database
    
    if (isValid) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vinda de volta 💜",
      });
      
      navigate("/dashboard");
    } else {
      toast({
        title: "Credenciais inválidas",
        description: "E-mail ou senha incorretos. Tente novamente.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-card rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-secondary mb-2">FichaZen</h1>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Bem-vinda de volta 💜
            </h2>
            <p className="text-muted-foreground">
              Acesse seu painel e continue gerenciando seus clientes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="maria@exemplo.com"
                {...register("email")}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="senha" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••"
                {...register("senha")}
                className="mt-1"
              />
              {errors.senha && (
                <p className="text-sm text-destructive mt-1">{errors.senha.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Lembrar de mim
              </label>
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <button
              onClick={() => navigate("/recuperar-senha")}
              className="text-secondary hover:underline block w-full"
            >
              Esqueci minha senha
            </button>
            
            <p className="text-muted-foreground">
              Ainda não tem conta?{" "}
              <button
                onClick={() => navigate("/registro")}
                className="text-secondary font-semibold hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar para página inicial
          </button>
        </div>
      </div>
    </div>
  );
}
