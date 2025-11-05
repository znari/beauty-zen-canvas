import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { FileText, MessageCircle, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import InputMask from "react-input-mask";
import { validateCPForCNPJ, cleanDocument, getDocumentMask } from "@/lib/validateDocument";
import { supabase } from "@/integrations/supabase/client";

const registrationSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  nomeEstudio: z.string().min(2, "Nome do estúdio deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("E-mail inválido").max(255),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(20),
  cpfCnpj: z.string()
    .min(1, "CPF ou CNPJ é obrigatório")
    .refine((val) => validateCPForCNPJ(val), {
      message: "CPF ou CNPJ inválido",
    }),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function Registration() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentMask, setDocumentMask] = useState('999.999.999-999');
  const [phoneMask, setPhoneMask] = useState('(99) 99999-9999');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    
    // Clean CPF/CNPJ (remove mask)
    const cleanedDocument = cleanDocument(data.cpfCnpj);
    
    // Check if CPF/CNPJ already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('cpf_cnpj')
      .eq('cpf_cnpj', cleanedDocument)
      .maybeSingle();
    
    if (checkError) {
      toast({
        title: "Erro ao verificar documento",
        description: "Não foi possível verificar o CPF/CNPJ. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (existingProfile) {
      toast({
        title: "CPF/CNPJ já cadastrado",
        description: "Este CPF/CNPJ já está cadastrado no sistema.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const { error } = await signUp(data.email, data.senha, {
      full_name: data.nomeCompleto,
      studio_name: data.nomeEstudio,
      phone: data.telefone,
      cpf_cnpj: cleanedDocument,
    });
    
    if (error) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message.includes("already registered")) {
        errorMessage = "Este e-mail já está cadastrado.";
      } else if (error.message.includes("Password should be")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    } else {
      toast({
        title: "Conta criada com sucesso! 💖",
        description: "Verifique seu e-mail para confirmar o cadastro e fazer login.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Column - Benefits */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary/10 p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Organize seus atendimentos com o FichaZen 💅
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Digitalize fichas, automatize mensagens e salve tudo na nuvem.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-secondary/20 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Histórico completo de clientes</h3>
                <p className="text-sm text-muted-foreground">Acesse todas as informações em um único lugar</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-secondary/20 p-3 rounded-xl">
                <MessageCircle className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Envio de mensagens via WhatsApp</h3>
                <p className="text-sm text-muted-foreground">Confirme agendamentos com um clique</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-secondary/20 p-3 rounded-xl">
                <Camera className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Antes e depois salvos no cloud</h3>
                <p className="text-sm text-muted-foreground">Portfólio organizado e seguro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-card shadow-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Crie sua conta gratuita
            </h2>
            <p className="text-muted-foreground mb-6">
              Teste grátis por 15 dias. Sem cartão 💖
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nomeCompleto">Nome Completo</Label>
                <Input
                  id="nomeCompleto"
                  placeholder="Maria Silva"
                  {...register("nomeCompleto")}
                  className="mt-1"
                />
                {errors.nomeCompleto && (
                  <p className="text-sm text-destructive mt-1">{errors.nomeCompleto.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nomeEstudio">Nome do Estúdio</Label>
                <Input
                  id="nomeEstudio"
                  placeholder="Estúdio Beleza Zen"
                  {...register("nomeEstudio")}
                  className="mt-1"
                />
                {errors.nomeEstudio && (
                  <p className="text-sm text-destructive mt-1">{errors.nomeEstudio.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
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
                <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <InputMask
                    mask={phoneMask}
                    {...register("telefone")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      // Celular (11 dígitos) ou fixo (10 dígitos)
                      setPhoneMask(value.length <= 10 ? '(99) 9999-99999' : '(99) 99999-9999');
                      register("telefone").onChange(e);
                    }}
                  >
                    {/* @ts-ignore */}
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="telefone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="mt-1 pl-10"
                      />
                    )}
                  </InputMask>
                </div>
                {errors.telefone && (
                  <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <InputMask
                    mask={documentMask}
                    {...register("cpfCnpj")}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDocumentMask(getDocumentMask(value));
                      register("cpfCnpj").onChange(e);
                    }}
                  >
                    {/* @ts-ignore */}
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="cpfCnpj"
                        placeholder="000.000.000-00"
                        className="mt-1 pl-10"
                      />
                    )}
                  </InputMask>
                </div>
                {errors.cpfCnpj && (
                  <p className="text-sm text-destructive mt-1">{errors.cpfCnpj.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
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

              <div>
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="••••••"
                  {...register("confirmarSenha")}
                  className="mt-1"
                />
                {errors.confirmarSenha && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmarSenha.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando conta..." : "Começar meu teste grátis"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Já tem conta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-secondary font-semibold hover:underline"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
