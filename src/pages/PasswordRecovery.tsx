import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const recoverySchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido"),
});

type RecoveryForm = z.infer<typeof recoverySchema>;

const PasswordRecovery = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryForm>({
    resolver: zodResolver(recoverySchema),
  });

  const onSubmit = async (data: RecoveryForm) => {
    setIsSubmitting(true);
    
    // Simular envio de email (será substituído por integração real com Lovable Cloud)
    setTimeout(() => {
      toast({
        title: "E-mail enviado! 💌",
        description: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
      
      setIsSubmitting(false);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FichaZen</h1>
        </div>

        <Card className="shadow-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
            <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
            <CardDescription>
              Digite o e-mail cadastrado para receber um link de redefinição.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full hover-lift"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
              </Button>

              {/* Link para Login */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Lembrou sua senha? </span>
                <Link
                  to="/login"
                  className="text-secondary font-medium hover:underline"
                >
                  Entrar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordRecovery;
