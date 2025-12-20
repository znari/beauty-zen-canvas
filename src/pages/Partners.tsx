import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Link as LinkIcon, BarChart3, Gift, ArrowRight, Eye, EyeOff } from "lucide-react";
import { usePartnerRegistration } from "@/hooks/usePartnerRegistration";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  pixKey: z.string().min(5, "Chave PIX inválida"),
  pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
  isFichaZenClient: z.boolean().default(false),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  accountPassword: z.string().optional(),
  message: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
}).refine((data) => {
  // If NOT a client, password is required
  if (!data.isFichaZenClient) {
    return data.password && data.password.length >= 6;
  }
  return true;
}, {
  message: "Senha deve ter pelo menos 6 caracteres",
  path: ["password"],
}).refine((data) => {
  // If NOT a client, confirm password must match
  if (!data.isFichaZenClient) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => {
  // If IS a client, account password is required
  if (data.isFichaZenClient) {
    return data.accountPassword && data.accountPassword.length >= 6;
  }
  return true;
}, {
  message: "Confirme sua senha da conta FichaZen",
  path: ["accountPassword"],
});

type FormData = z.infer<typeof formSchema>;

const Partners = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending } = usePartnerRegistration();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccountPassword, setShowAccountPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      pixKey: "",
      pixKeyType: "cpf",
      isFichaZenClient: false,
      password: "",
      confirmPassword: "",
      accountPassword: "",
      message: "",
      acceptTerms: false,
    },
  });

  const isFichaZenClient = form.watch("isFichaZenClient");

  const onSubmit = (data: FormData) => {
    register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      pixKey: data.pixKey,
      pixKeyType: data.pixKeyType,
      isFichaZenClient: data.isFichaZenClient,
      password: data.isFichaZenClient ? data.accountPassword : data.password,
      message: data.message,
    }, {
      onSuccess: () => navigate("/parceiros/sucesso"),
    });
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "R$ 20 por indicação",
      description: "Receba um valor fixo para cada novo cliente que assinar através do seu link",
    },
    {
      icon: LinkIcon,
      title: "Link exclusivo",
      description: "Seu código de parceiro único para compartilhar com sua rede",
    },
    {
      icon: BarChart3,
      title: "Dashboard completo",
      description: "Acompanhe suas indicações, conversões e ganhos em tempo real",
    },
    {
      icon: Gift,
      title: "Pagamento via PIX",
      description: "Receba suas comissões diretamente na sua conta",
    },
  ];

  const steps = [
    { step: 1, title: "Cadastre-se", description: "Preencha o formulário abaixo" },
    { step: 2, title: "Aguarde aprovação", description: "Analisaremos sua solicitação" },
    { step: 3, title: "Compartilhe", description: "Use seu link de indicação" },
    { step: 4, title: "Receba", description: "Ganhe por cada conversão" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Programa de Parceiros
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ganhe dinheiro indicando o <span className="text-primary">FichaZen</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Torne-se um parceiro e receba comissões por cada novo cliente que assinar através do seu link de indicação.
          </p>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Como funciona</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {steps.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-2 mx-auto">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground mx-4" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Registration Form */}
        <section className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Seja um Parceiro
              </CardTitle>
              <CardDescription>
                Preencha os dados abaixo para se cadastrar no programa de parceiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pixKeyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de chave PIX</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cpf">CPF</SelectItem>
                                <SelectItem value="cnpj">CNPJ</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Telefone</SelectItem>
                                <SelectItem value="random">Aleatória</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pixKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chave PIX</FormLabel>
                            <FormControl>
                              <Input placeholder="Sua chave PIX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isFichaZenClient"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Já sou cliente FichaZen</FormLabel>
                            <FormDescription>
                              Marque se você já utiliza o FichaZen
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Password fields - conditional based on isFichaZenClient */}
                    {!isFichaZenClient ? (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground">
                          Crie uma senha para acessar o dashboard de parceiro após a aprovação:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type={showPassword ? "text" : "password"} 
                                      placeholder="••••••" 
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0 top-0 h-full px-3"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type={showConfirmPassword ? "text" : "password"} 
                                      placeholder="••••••" 
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0 top-0 h-full px-3"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground">
                          Confirme a senha da sua conta FichaZen para vincular ao programa de parceiros:
                        </p>
                        <FormField
                          control={form.control}
                          name="accountPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha da conta FichaZen</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showAccountPassword ? "text" : "password"} 
                                    placeholder="••••••" 
                                    {...field} 
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowAccountPassword(!showAccountPassword)}
                                  >
                                    {showAccountPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Conte-nos como pretende divulgar o FichaZen..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Aceito os{" "}
                              <Link to="/termos" className="text-primary hover:underline">
                                termos de uso
                              </Link>
                              {" "}do programa de parceiros
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? "Enviando..." : "Enviar solicitação"}
                    </Button>
                  </form>
                </Form>
            </CardContent>
          </Card>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Partners;