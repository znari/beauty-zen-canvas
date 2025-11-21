import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Check, Crown, Sparkles, Zap, MessageCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PlansManagement = () => {
  const { data: subscription, isLoading } = useSubscriptionStatus();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Buscar definições de planos
  const { data: planDefinitions = [] } = useQuery({
    queryKey: ["plan-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_definitions")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Carregando informações do plano..." />;
  }

  if (!subscription) return null;

  const getUsagePercentage = (current: number, max: number | null) => {
    if (max === null) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'essencial': return Sparkles;
      case 'pro': return Crown;
      case 'ultimate': return Zap;
      case 'ultimate_plus': return MessageCircle;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Assinatura</CardTitle>
          <CardDescription>
            Informações sobre seu plano atual e uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plano Atual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Plano Atual:</span>
              <Badge variant={subscription.isTrialActive ? "secondary" : "default"}>
                {subscription.plan === 'free' ? 'Teste Grátis' : 
                 planDefinitions.find((p: any) => p.id === subscription.plan)?.name || subscription.plan}
              </Badge>
            </div>
            
            {subscription.isTrialActive && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Teste grátis expira em {subscription.daysUntilExpiry} dia(s)
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Escolha um plano abaixo para continuar usando o FichaZen após o período de teste
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Uso de Recursos */}
          {subscription.limits.maxClients !== null && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Clientes</span>
                <span className="text-sm text-muted-foreground">
                  {subscription.currentUsage.clientsCount} / {subscription.limits.maxClients}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(
                  subscription.currentUsage.clientsCount,
                  subscription.limits.maxClients
                )} 
              />
            </div>
          )}

          {subscription.limits.maxAnamneses !== null && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Fichas de Anamnese</span>
                <span className="text-sm text-muted-foreground">
                  {subscription.currentUsage.anamnesesCount} / {subscription.limits.maxAnamneses}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(
                  subscription.currentUsage.anamnesesCount,
                  subscription.limits.maxAnamneses
                )} 
              />
            </div>
          )}

          {subscription.limits.maxStorageGB !== null && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Armazenamento</span>
                <span className="text-sm text-muted-foreground">
                  {(subscription.currentUsage.storageUsedMB / 1024).toFixed(2)} GB / {subscription.limits.maxStorageGB} GB
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(
                  subscription.currentUsage.storageUsedMB / 1024,
                  subscription.limits.maxStorageGB
                )} 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Escolha seu plano</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planDefinitions.map((plan: any) => {
            const Icon = getPlanIcon(plan.id);
            const isCurrent = subscription.plan === plan.id;
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <Card
                key={plan.id}
                className={`${
                  isCurrent ? 'border-2 border-primary' : ''
                } ${
                  plan.id === 'ultimate_plus' ? 'opacity-75' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        {isCurrent && (
                          <Badge variant="outline" className="mt-1">Plano Atual</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {plan.price_monthly > 0 ? (
                        <>
                          <div className="text-2xl font-bold">R$ {plan.price_monthly.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">/mês</div>
                        </>
                      ) : (
                        <div className="text-sm font-semibold">Sob consulta</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === 'ultimate_plus' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <a 
                        href="https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20Zen%20Ultimate%20%2B%20IA"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Entre em contato
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant={isCurrent ? "outline" : "cta"}
                      className="w-full"
                      disabled={isCurrent}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {isCurrent ? 'Plano Atual' : 'Escolher Plano'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Nota sobre pagamento */}
      {selectedPlan && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              ℹ️ <strong>Sistema de pagamento em desenvolvimento:</strong> Em breve você poderá assinar diretamente pela plataforma. 
              Por enquanto, entre em contato conosco pelo WhatsApp para ativar seu plano.
            </p>
            <Button
              variant="default"
              className="mt-4"
              asChild
            >
              <a 
                href={`https://wa.me/5511999999999?text=Quero%20assinar%20o%20plano%20${selectedPlan}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com suporte
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
