import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Crown, Sparkles, Zap, MessageCircle, AlertTriangle, Loader2, History, Settings } from "lucide-react";
import { PaymentLoadingModal } from "@/components/PaymentLoadingModal";
import { BillingPeriodModal } from "@/components/BillingPeriodModal";
import { PlanActivationBanner } from "@/components/PlanActivationBanner";
import { PlanCard } from "@/components/PlanCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateStripeCheckout } from "@/hooks/useCreateStripeCheckout";
import { useCustomerPortal } from "@/hooks/useCustomerPortal";
import { toast } from "sonner";
export const PlansManagement = () => {
  const navigate = useNavigate();
  const {
    data: subscription,
    isLoading
  } = useSubscriptionStatus();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showBillingPeriodModal, setShowBillingPeriodModal] = useState(false);
  const [processingPeriod, setProcessingPeriod] = useState<'monthly' | 'yearly' | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const createStripeCheckout = useCreateStripeCheckout();
  const { openCustomerPortal, isLoading: isLoadingPortal } = useCustomerPortal();
  const queryClient = useQueryClient();

  // Buscar definições de planos
  const {
    data: planDefinitions = []
  } = useQuery({
    queryKey: ["plan-definitions"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("plan_definitions").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    }
  });

  // Detectar retorno do pagamento
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('✅ Pagamento confirmado!', {
        description: 'Aguarde enquanto ativamos seu plano. Isso pode levar alguns segundos.',
        duration: 5000
      });

      // Marcar como aguardando ativação (caso não tenha sido feito antes)
      const pending = localStorage.getItem('pendingPlanActivation');
      if (!pending) {
        localStorage.setItem('pendingPlanActivation', JSON.stringify({
          planId: 'unknown',
          timestamp: Date.now(),
          status: 'waiting'
        }));
      }
      queryClient.invalidateQueries({
        queryKey: ['subscription-status']
      });
      window.history.replaceState({}, '', '/configuracoes/perfil?tab=pagamento');
    } else if (paymentStatus === 'completed' || paymentStatus === 'pending') {
      toast.info('Processando pagamento...');
      queryClient.invalidateQueries({
        queryKey: ['subscription-status']
      });
      window.history.replaceState({}, '', '/configuracoes/perfil?tab=pagamento');
    } else if (paymentStatus === 'failed') {
      toast.error('Pagamento não aprovado. Tente novamente.');
      window.history.replaceState({}, '', '/configuracoes/perfil?tab=pagamento');
    }
  }, [queryClient]);

  // Abrir modal de escolha de período
  const handleChoosePlan = (planId: string) => {
    if (!subscription) return;
    setPendingPlanId(planId);
    setShowBillingPeriodModal(true);
  };

  // Processar pagamento com período selecionado
  const handleSelectPeriod = async (billingPeriod: 'monthly' | 'yearly') => {
    if (!pendingPlanId) return;
    setProcessingPeriod(billingPeriod);
    setProcessingPayment(true);
    setSelectedPlan(pendingPlanId);

    // Armazenar plano pendente
    localStorage.setItem('pendingPlanActivation', JSON.stringify({
      planId: pendingPlanId,
      timestamp: Date.now(),
      status: 'waiting',
      billingPeriod
    }));
    try {
      const result = await createStripeCheckout.mutateAsync({
        planId: pendingPlanId,
        billingPeriod
      });
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        toast.success('🎉 Redirecionando para o checkout...');
        localStorage.setItem('lastTransactionId', result.transactionId || '');
        setShowBillingPeriodModal(false);
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('pendingPlanActivation');
    } finally {
      setProcessingPayment(false);
      setSelectedPlan(null);
      setProcessingPeriod(null);
      setPendingPlanId(null);
    }
  };
  if (isLoading) {
    return <LoadingSpinner message="Carregando informações do plano..." />;
  }
  if (!subscription) return null;
  const getUsagePercentage = (current: number, max: number | null) => {
    if (max === null) return 0;
    return Math.min(current / max * 100, 100);
  };
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'essencial':
        return Sparkles;
      case 'pro':
        return Crown;
      case 'ultimate':
        return Zap;
      case 'ultimate_plus':
        return MessageCircle;
      default:
        return Sparkles;
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
    setShowBillingPeriodModal(true);
  };

  // Obter informações do plano pendente para o modal
  const pendingPlanInfo = pendingPlanId ? planDefinitions.find((p: any) => p.id === pendingPlanId) : null;
  return <div className="space-y-6">
      {/* Banner de ativação pendente */}
      <PlanActivationBanner />
      
      {/* Modal de escolha de período de assinatura */}
      <BillingPeriodModal isOpen={showBillingPeriodModal} onClose={() => {
      if (!processingPayment) {
        setShowBillingPeriodModal(false);
        setPendingPlanId(null);
      }
    }} onSelectPeriod={handleSelectPeriod} planName={pendingPlanInfo?.name || ""} priceMonthly={pendingPlanInfo?.price_monthly || 0} priceYearly={pendingPlanInfo?.price_yearly || 0} isProcessing={processingPayment} processingPeriod={processingPeriod} />
      
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
            return <div className={`${statusInfo.color} border rounded-lg p-4 flex items-center gap-3`}>
                  <span className="text-2xl">{statusInfo.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{statusInfo.text}</p>
                    {subscription.status === 'active' && subscription.daysUntilRenewal > 0 && <p className="text-sm mt-1">
                        Renovação em {subscription.daysUntilRenewal} dia(s)
                      </p>}
                    {subscription.isNearExpiry && <p className="text-sm mt-1 font-semibold">
                        ⚠️ Sua assinatura está próxima do vencimento!
                      </p>}
                  </div>
                </div>;
          })()}
          </div>

          {/* Plano Atual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Plano Atual:</span>
              <Badge variant={subscription.isTrialActive ? "secondary" : "default"}>
                {subscription.plan === 'free' ? 'Teste Grátis' : planDefinitions.find((p: any) => p.id === subscription.plan)?.name || subscription.plan}
              </Badge>
            </div>
          </div>

          {/* Informações de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Último Pagamento */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Último Pagamento</p>
              <p className="font-semibold">
                {subscription.lastPaymentDate ? new Date(subscription.lastPaymentDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : 'Nenhum pagamento realizado'}
              </p>
            </div>

            {/* Próxima Renovação */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Próxima Renovação</p>
              <p className="font-semibold">
                {subscription.subscriptionEndsAt ? new Date(subscription.subscriptionEndsAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : 'Não aplicável'}
              </p>
            </div>
          </div>

          {/* Botões de Ação da Assinatura */}
          {subscription.status !== 'trialing' && subscription.plan !== 'free' && <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="cta" className="flex-1 gap-2" onClick={() => handleRenewSubscription(subscription.plan)} disabled={processingPayment || isLoadingPortal}>
                {processingPayment ? <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </> : <>
                    <Crown className="h-4 w-4" />
                    Renovar Assinatura
                  </>}
              </Button>
              
              {subscription.status === 'active' && <Button variant="outline" className="flex-1 gap-2" onClick={openCustomerPortal} disabled={processingPayment || isLoadingPortal}>
                {isLoadingPortal ? <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </> : <>
                    <Settings className="h-4 w-4" />
                    Gerenciar Assinatura
                  </>}
              </Button>}
            </div>}

          {/* Aviso de Trial */}
          {subscription.isTrialActive && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">
                  Teste grátis expira em {subscription.daysUntilExpiry} dia(s)
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Escolha um plano abaixo para continuar usando o FichaZen
                </p>
              </div>
            </div>}

          {/* Uso de Recursos */}
          {subscription.limits.maxClients !== null && <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Clientes</span>
                <span className="text-sm text-muted-foreground">
                  {subscription.currentUsage.clientsCount} / {subscription.limits.maxClients}
                </span>
              </div>
              <Progress value={getUsagePercentage(subscription.currentUsage.clientsCount, subscription.limits.maxClients)} />
            </div>}

          {subscription.limits.maxAnamneses !== null && <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Fichas de Anamnese</span>
                <span className="text-sm text-muted-foreground">
                  {subscription.currentUsage.anamnesesCount} / {subscription.limits.maxAnamneses}
                </span>
              </div>
              <Progress value={getUsagePercentage(subscription.currentUsage.anamnesesCount, subscription.limits.maxAnamneses)} />
            </div>}

          {subscription.limits.maxStorageGB !== null && <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Armazenamento</span>
                <span className="text-sm text-muted-foreground">
                  {(subscription.currentUsage.storageUsedMB / 1024).toFixed(2)} GB / {subscription.limits.maxStorageGB} GB
                </span>
              </div>
              <Progress value={getUsagePercentage(subscription.currentUsage.storageUsedMB / 1024, subscription.limits.maxStorageGB)} />
            </div>}
        </CardContent>
      </Card>

      {/* Botão para Histórico de Pagamentos */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate('/pagamentos')} className="gap-2">
          <History className="h-4 w-4" />
          Ver Histórico de Pagamentos
        </Button>
      </div>

      {/* Planos Disponíveis */}
      <div>
        <h3 className="text-lg font-semibold mb-6">Escolha seu plano</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planDefinitions.map((plan: any, index: number) => {
          const Icon = getPlanIcon(plan.id);
          const isCurrent = subscription.plan === plan.id;
          const features = Array.isArray(plan.features) ? plan.features : [];
          const isUltimatePlus = plan.id === 'ultimate_plus';
          return <PlanCard key={plan.id} id={plan.id} name={plan.name} icon={Icon} features={features} priceMonthly={plan.price_monthly} isCurrent={isCurrent} showCurrentBadge={true} isDisabled={processingPayment} isProcessing={processingPayment && selectedPlan === plan.id} ctaText={processingPayment && selectedPlan === plan.id ? 'Processando...' : isCurrent ? 'Plano Atual' : isUltimatePlus ? 'Entre em contato' : 'Escolher Plano'} ctaVariant={isCurrent ? 'outline' : 'cta'} onCtaClick={isUltimatePlus ? undefined : () => handleChoosePlan(plan.id)} ctaLink={isUltimatePlus ? 'https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20o%20Zen%20Ultimate%20%2B%20IA' : undefined} ctaLinkExternal={isUltimatePlus} variant="dashboard" animationDelay={index * 100} className={isUltimatePlus ? 'opacity-75' : ''} />;
        })}
        </div>
      </div>

      {/* Modal de Carregamento */}
      <PaymentLoadingModal isOpen={processingPayment && !showBillingPeriodModal} />
    </div>;
};