import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Check, Crown, Sparkles, Zap, MessageCircle, AlertTriangle, Loader2, History } from "lucide-react";
import { PaymentLoadingModal } from "@/components/PaymentLoadingModal";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { PlanActivationBanner } from "@/components/PlanActivationBanner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateMercadoPagoPayment } from "@/hooks/useCreateMercadoPagoPayment";
import { toast } from "sonner";
import { celebratePayment } from "@/lib/confetti";

export const PlansManagement = () => {
  const navigate = useNavigate();
  const { data: subscription, isLoading } = useSubscriptionStatus();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  const createMercadoPagoPayment = useCreateMercadoPagoPayment();
  const queryClient = useQueryClient();

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

  // Detectar retorno do pagamento
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast.success(
        '✅ Pagamento confirmado!',
        {
          description: 'Aguarde enquanto ativamos seu plano. Isso pode levar alguns segundos.',
          duration: 5000,
        }
      );
      
      // Marcar como aguardando ativação (caso não tenha sido feito antes)
      const pending = localStorage.getItem('pendingPlanActivation');
      if (!pending) {
        localStorage.setItem('pendingPlanActivation', JSON.stringify({
          planId: 'unknown',
          timestamp: Date.now(),
          status: 'waiting'
        }));
      }
      
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      window.history.replaceState({}, '', '/configuracoes/perfil?tab=pagamento');
    } else if (paymentStatus === 'completed' || paymentStatus === 'pending') {
      toast.info('Processando pagamento...');
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      window.history.replaceState({}, '', '/configuracoes/perfil?tab=pagamento');
    } else if (paymentStatus === 'failed') {
      toast.error('Pagamento não aprovado. Tente novamente.');
      window.history.replaceState({}, '', '/configuracoes/perfil?tab=pagamento');
    }
  }, [queryClient]);

  // Abrir modal de escolha de método de pagamento
  const handleChoosePlan = (planId: string) => {
    if (!subscription) return;
    setPendingPlanId(planId);
    setShowPaymentMethodModal(true);
  };

  // Processar pagamento via PIX (Mercado Pago)
  const handlePixPayment = async () => {
    if (!pendingPlanId) return;
    
    setPaymentMethod("pix");
    setProcessingPayment(true);
    setSelectedPlan(pendingPlanId);
    
    // Armazenar plano pendente
    localStorage.setItem('pendingPlanActivation', JSON.stringify({
      planId: pendingPlanId,
      timestamp: Date.now(),
      status: 'waiting',
      method: 'pix',
      billingPeriod
    }));
    
    try {
      const result = await createMercadoPagoPayment.mutateAsync({ 
        planId: pendingPlanId,
        billingPeriod 
      });
      
      if (result.success && result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
        toast.success('🎉 Redirecionando para o Mercado Pago...');
        localStorage.setItem('lastTransactionId', result.transactionId || '');
        setShowPaymentMethodModal(false);
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('pendingPlanActivation');
    } finally {
      setProcessingPayment(false);
      setSelectedPlan(null);
      setPaymentMethod(null);
      setPendingPlanId(null);
    }
  };

  // Processar pagamento via Cartão (Mercado Pago)
  const handleCardPayment = async () => {
    if (!pendingPlanId) return;
    
    setPaymentMethod("card");
    setProcessingPayment(true);
    setSelectedPlan(pendingPlanId);
    
    // Armazenar plano pendente
    localStorage.setItem('pendingPlanActivation', JSON.stringify({
      planId: pendingPlanId,
      timestamp: Date.now(),
      status: 'waiting',
      method: 'card',
      billingPeriod
    }));
    
    try {
      const result = await createMercadoPagoPayment.mutateAsync({ 
        planId: pendingPlanId,
        billingPeriod 
      });
      
      if (result.success && result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
        toast.success('🎉 Redirecionando para o Mercado Pago...');
        localStorage.setItem('lastTransactionId', result.transactionId || '');
        setShowPaymentMethodModal(false);
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('pendingPlanActivation');
    } finally {
      setProcessingPayment(false);
      setSelectedPlan(null);
      setPaymentMethod(null);
      setPendingPlanId(null);
    }
  };

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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: 'Ativo ✅',
          color: 'bg-green-50 border-green-200 text-green-900',
          icon: '✅'
        };
      case 'trialing':
        return {
          text: 'Teste Grátis 🎁',
          color: 'bg-blue-50 border-blue-200 text-blue-900',
          icon: '🎁'
        };
      case 'payment_required':
        return {
          text: 'Pagamento Pendente ⚠️',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
          icon: '⚠️'
        };
      case 'expired':
        return {
          text: 'Assinatura Expirada ⏰',
          color: 'bg-red-50 border-red-200 text-red-900',
          icon: '⏰'
        };
      case 'cancelled':
        return {
          text: 'Cancelada ❌',
          color: 'bg-gray-50 border-gray-200 text-gray-900',
          icon: '❌'
        };
      default:
        return {
          text: 'Status Desconhecido',
          color: 'bg-gray-50 border-gray-200 text-gray-900',
          icon: '❓'
        };
    }
  };

  const handleRenewSubscription = (currentPlanId: string) => {
    if (!subscription) return;
    setPendingPlanId(currentPlanId);
    setShowPaymentMethodModal(true);
  };

  // Obter informações do plano pendente para o modal
  const pendingPlanInfo = pendingPlanId 
    ? planDefinitions.find((p: any) => p.id === pendingPlanId) 
    : null;

  // Calcular economia anual
  const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number) => {
    const fullYearlyPrice = monthlyPrice * 12;
    return fullYearlyPrice - yearlyPrice;
  };

  // Obter preço baseado no período selecionado
  const getDisplayPrice = (plan: any) => {
    if (billingPeriod === 'yearly') {
      return plan.price_yearly || 0;
    }
    return plan.price_monthly || 0;
  };

  return (
    <div className="space-y-6">
      {/* Banner de ativação pendente */}
      <PlanActivationBanner />
      
      {/* Modal de escolha de método de pagamento */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => {
          if (!processingPayment) {
            setShowPaymentMethodModal(false);
            setPendingPlanId(null);
          }
        }}
        onSelectPix={handlePixPayment}
        onSelectCard={handleCardPayment}
        planName={pendingPlanInfo?.name || ""}
        planPrice={pendingPlanInfo ? getDisplayPrice(pendingPlanInfo) : 0}
        billingPeriod={billingPeriod}
        isProcessing={processingPayment}
        processingMethod={paymentMethod}
      />
      
      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Assinatura</CardTitle>
          <CardDescription>
            Informações sobre seu plano atual e uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status do Pagamento */}
          <div>
            <span className="text-sm font-medium mb-2 block">Status do Pagamento:</span>
            {(() => {
              const statusInfo = getStatusDisplay(subscription.status);
              return (
                <div className={`${statusInfo.color} border rounded-lg p-4 flex items-center gap-3`}>
                  <span className="text-2xl">{statusInfo.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{statusInfo.text}</p>
                    {subscription.status === 'active' && subscription.daysUntilRenewal > 0 && (
                      <p className="text-sm mt-1">
                        Renovação em {subscription.daysUntilRenewal} dia(s)
                      </p>
                    )}
                    {subscription.isNearExpiry && (
                      <p className="text-sm mt-1 font-semibold">
                        ⚠️ Sua assinatura está próxima do vencimento!
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Plano Atual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Plano Atual:</span>
              <Badge variant={subscription.isTrialActive ? "secondary" : "default"}>
                {subscription.plan === 'free' ? 'Teste Grátis' : 
                 planDefinitions.find((p: any) => p.id === subscription.plan)?.name || subscription.plan}
              </Badge>
            </div>
          </div>

          {/* Informações de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Último Pagamento */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Último Pagamento</p>
              <p className="font-semibold">
                {subscription.lastPaymentDate 
                  ? new Date(subscription.lastPaymentDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Nenhum pagamento realizado'
                }
              </p>
            </div>

            {/* Próxima Renovação */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Próxima Renovação</p>
              <p className="font-semibold">
                {subscription.subscriptionEndsAt 
                  ? new Date(subscription.subscriptionEndsAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Não aplicável'
                }
              </p>
            </div>
          </div>

          {/* Botão de Renovação */}
          {subscription.status !== 'trialing' && subscription.plan !== 'free' && (
            <div>
              <Button
                variant="cta"
                className="w-full gap-2"
                onClick={() => handleRenewSubscription(subscription.plan)}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Renovar Assinatura Agora
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Renove antecipadamente e ganhe mais dias de acesso
              </p>
            </div>
          )}

          {/* Aviso de Trial */}
          {subscription.isTrialActive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">
                  Teste grátis expira em {subscription.daysUntilExpiry} dia(s)
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Escolha um plano abaixo para continuar usando o FichaZen
                </p>
              </div>
            </div>
          )}

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

      {/* Botão para Histórico de Pagamentos */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => navigate('/pagamentos')}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Ver Histórico de Pagamentos
        </Button>
      </div>

      {/* Planos Disponíveis */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold">Escolha seu plano</h3>
          
          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual
              <Badge className="bg-green-500 text-white text-xs">-30%</Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planDefinitions.map((plan: any) => {
            const Icon = getPlanIcon(plan.id);
            const isCurrent = subscription.plan === plan.id;
            const features = Array.isArray(plan.features) ? plan.features : [];
            const displayPrice = getDisplayPrice(plan);
            const yearlySavings = plan.price_yearly && plan.price_monthly 
              ? calculateYearlySavings(plan.price_monthly, plan.price_yearly)
              : 0;

            return (
              <Card
                key={plan.id}
                className={`${
                  isCurrent ? 'border-2 border-primary' : ''
                } ${
                  plan.id === 'ultimate_plus' ? 'opacity-75' : ''
                } ${
                  processingPayment ? 'opacity-50' : ''
                } transition-opacity`}
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
                      {displayPrice > 0 ? (
                        <div>
                          {billingPeriod === 'yearly' && plan.price_monthly && (
                            <div className="text-sm text-muted-foreground line-through">
                              R$ {(plan.price_monthly * 12).toFixed(2)}
                            </div>
                          )}
                          <div className="text-2xl font-bold">R$ {displayPrice.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            /{billingPeriod === 'yearly' ? 'ano' : 'mês'}
                          </div>
                          {billingPeriod === 'yearly' && yearlySavings > 0 && (
                            <Badge className="mt-1 bg-green-500 text-white text-xs">
                              Economize R$ {yearlySavings.toFixed(2)}/ano
                            </Badge>
                          )}
                        </div>
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
                      disabled={isCurrent || processingPayment}
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      {processingPayment && selectedPlan === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : isCurrent ? (
                        'Plano Atual'
                      ) : (
                        'Escolher Plano'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal de Carregamento */}
      <PaymentLoadingModal isOpen={processingPayment && !showPaymentMethodModal} />
    </div>
  );
};
