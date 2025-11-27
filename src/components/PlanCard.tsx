import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface PlanCardProps {
  // Dados básicos
  id: string;
  name: string;
  description?: string;
  icon: LucideIcon;
  features: string[];
  
  // Preços
  priceMonthly: number | null;
  priceYearly?: number | null;
  billingPeriod?: 'monthly' | 'yearly';
  showSavings?: boolean;
  
  // Estados visuais
  highlighted?: boolean;
  isCurrent?: boolean;
  comingSoon?: boolean;
  isDisabled?: boolean;
  isProcessing?: boolean;
  
  // Badges
  badge?: string;
  showCurrentBadge?: boolean;
  badgePosition?: 'top' | 'corner';
  badgeVariant?: 'pulse' | 'static';
  
  // CTA
  ctaText: string;
  ctaVariant?: 'default' | 'outline' | 'hero' | 'cta';
  onCtaClick?: () => void;
  ctaLink?: string;
  ctaLinkExternal?: boolean;
  
  // Layout
  variant?: 'dashboard' | 'landing' | 'compact';
  animationDelay?: number;
  className?: string;
  
  // Props específicas para compact
  subtitle?: string;
  showMonthlyEquivalent?: boolean;
  compactFeatures?: string[];
}

// Helpers
const formatPrice = (price: number) => {
  return price.toFixed(2).replace('.', ',');
};

const calculateSavings = (monthly: number, yearly: number) => {
  return (monthly * 12) - yearly;
};

export const PlanCard = ({
  id,
  name,
  description,
  icon: Icon,
  features,
  priceMonthly,
  priceYearly,
  billingPeriod = 'monthly',
  showSavings = false,
  highlighted = false,
  isCurrent = false,
  comingSoon = false,
  isDisabled = false,
  isProcessing = false,
  badge,
  showCurrentBadge = false,
  badgePosition = 'top',
  badgeVariant = 'static',
  ctaText,
  ctaVariant = 'default',
  onCtaClick,
  ctaLink,
  ctaLinkExternal = false,
  variant = 'landing',
  animationDelay = 0,
  className = '',
  subtitle,
  showMonthlyEquivalent = false,
  compactFeatures,
}: PlanCardProps) => {
  const isDashboard = variant === 'dashboard';
  const isCompact = variant === 'compact';
  const isLanding = variant === 'landing';
  
  // Calcular preço a exibir
  const displayPrice = billingPeriod === 'yearly' && priceYearly ? priceYearly : priceMonthly;
  
  // Calcular economia
  const savings = priceMonthly && priceYearly ? calculateSavings(priceMonthly, priceYearly) : 0;
  
  // Equivalente mensal
  const monthlyEquivalent = priceYearly ? priceYearly / 12 : 0;

  // Features a exibir (compact usa compactFeatures ou primeiras 3)
  const displayFeatures = isCompact 
    ? (compactFeatures || features.slice(0, 3)) 
    : features;

  // Classes do card
  const cardClasses = [
    'relative flex flex-col h-full animate-fade-in',
    'transition-all duration-300',
    // Compact styles
    isCompact && !highlighted ? 'border-2 border-primary/40 hover:border-primary/70' : '',
    isCompact && highlighted ? 'border-2 border-primary bg-primary/5' : '',
    // Dashboard styles
    isDashboard ? 'hover:shadow-lg hover:border-primary/50' : '',
    // Landing styles
    isLanding ? 'hover:shadow-lg hover:-translate-y-1' : '',
    isLanding && highlighted ? 'border-2 border-secondary shadow-lg scale-105' : '',
    // Common states
    !isCompact && !highlighted && !isCurrent ? 'border border-border' : '',
    isCurrent ? 'border-2 border-primary' : '',
    comingSoon ? 'opacity-95' : '',
    isDisabled ? 'opacity-50' : '',
    className,
  ].filter(Boolean).join(' ');

  // Renderizar CTA
  const renderCTA = () => {
    const buttonVariant = isCurrent ? 'outline' : ctaVariant;
    const buttonDisabled = isCurrent || isDisabled || isProcessing;
    const buttonSize = isCompact ? 'default' : (isDashboard ? 'default' : 'lg');

    const buttonContent = isProcessing ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processando...
      </>
    ) : (
      ctaText
    );

    if (ctaLink) {
      // Use Link for internal routes, <a> for external
      if (ctaLinkExternal) {
        return (
          <Button
            variant={buttonVariant}
            size={buttonSize}
            className={`w-full mt-6 ${highlighted && isLanding ? 'shadow-button' : ''}`}
            asChild
          >
            <a 
              href={ctaLink} 
              target="_blank"
              rel="noopener noreferrer"
            >
              {buttonContent}
            </a>
          </Button>
        );
      }
      
      return (
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={`w-full mt-6 ${highlighted && isLanding ? 'shadow-button' : ''}`}
          asChild
        >
          <Link to={ctaLink}>
            {buttonContent}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={`w-full mt-6 ${highlighted && isLanding ? 'shadow-button' : ''}`}
        disabled={buttonDisabled}
        onClick={onCtaClick}
      >
        {buttonContent}
      </Button>
    );
  };

  // Renderizar badge no canto (para compact)
  const renderCornerBadge = () => {
    if (!badge || !isCompact || badgePosition !== 'corner') return null;
    
    return (
      <Badge 
        className={`absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 ${
          badgeVariant === 'pulse' ? 'animate-pulse' : ''
        }`}
      >
        {badge}
      </Badge>
    );
  };

  // Renderizar header compact
  const renderCompactHeader = () => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        highlighted ? 'bg-primary/20' : 'bg-muted'
      }`}>
        <Icon className={`h-5 w-5 ${highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div>
        <h3 className="font-semibold">{name}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );

  // Renderizar preço compact
  const renderCompactPrice = () => (
    <div className="mb-4">
      {/* Preço riscado para anual */}
      {billingPeriod === 'yearly' && priceMonthly && (
        <div className="text-sm text-muted-foreground line-through">
          R$ {formatPrice(priceMonthly * 12)}
        </div>
      )}
      
      {/* Preço principal */}
      <div className={`text-3xl font-bold ${highlighted ? 'text-primary' : ''}`}>
        R$ {formatPrice(displayPrice || 0)}
        <span className="text-base font-normal text-muted-foreground">
          /{billingPeriod === 'yearly' ? 'ano' : 'mês'}
        </span>
      </div>
      
      {/* Equivalente mensal */}
      {showMonthlyEquivalent && billingPeriod === 'yearly' && monthlyEquivalent > 0 && (
        <div className="text-sm text-muted-foreground">
          = R$ {formatPrice(monthlyEquivalent)}/mês
        </div>
      )}
      
      {/* Badge de economia inline */}
      {showSavings && billingPeriod === 'yearly' && savings > 0 && (
        <Badge className="bg-green-500 hover:bg-green-500 text-white mt-2">
          Economize R$ {formatPrice(savings)}/ano
        </Badge>
      )}
    </div>
  );

  // Renderizar features compact
  const renderCompactFeatures = () => (
    <ul className="space-y-2 text-sm text-muted-foreground flex-grow">
      {displayFeatures.map((feature, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="text-primary">✓</span> {feature}
        </li>
      ))}
    </ul>
  );

  // Layout Compact
  if (isCompact) {
    return (
      <Card
        className={cardClasses}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {renderCornerBadge()}
        
        <CardContent className="p-5 flex flex-col h-full">
          {renderCompactHeader()}
          {renderCompactPrice()}
          {renderCompactFeatures()}
          {renderCTA()}
        </CardContent>
      </Card>
    );
  }

  // Layout Dashboard e Landing (original)
  return (
    <Card
      className={cardClasses}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Badge promocional no topo */}
      {badge && isLanding && badgePosition === 'top' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-secondary text-secondary-foreground font-semibold">
            {badge}
          </Badge>
        </div>
      )}

      <CardHeader className={isDashboard ? '' : 'text-center pb-4'}>
        {isDashboard ? (
          // Layout Dashboard: ícone à esquerda, preço à direita
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{name}</CardTitle>
                {showCurrentBadge && isCurrent && (
                  <Badge variant="outline" className="mt-1">Plano Atual</Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              {priceMonthly && priceMonthly > 0 ? (
                <div>
                  <div className="text-lg font-bold">
                    A partir de R$ {formatPrice(priceMonthly)}
                  </div>
                  <div className="text-xs text-muted-foreground">/mês</div>
                </div>
              ) : (
                <div className="text-sm font-semibold">Sob consulta</div>
              )}
            </div>
          </div>
        ) : (
          // Layout Landing: centralizado
          <>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{name}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
            
            {/* Price */}
            <div className="pt-4">
              {displayPrice ? (
                <div 
                  key={`${id}-${billingPeriod}`}
                  className="space-y-1 animate-price-in"
                >
                  {/* Preço riscado (valor cheio anual) */}
                  {billingPeriod === 'yearly' && priceMonthly && (
                    <div className="text-sm text-muted-foreground line-through animate-fade-in">
                      R$ {formatPrice(priceMonthly * 12)}
                    </div>
                  )}
                  
                  {/* Preço atual */}
                  <div className="flex items-baseline justify-center gap-1 transition-all duration-300">
                    <span className="text-3xl font-bold text-foreground">
                      R$ {formatPrice(displayPrice)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      / {billingPeriod === 'yearly' ? 'ano' : 'mês'}
                    </span>
                  </div>

                  {/* Badge de economia com pulse */}
                  {showSavings && billingPeriod === 'yearly' && savings > 0 && (
                    <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs mt-2 animate-pulse">
                      Economize R$ {formatPrice(savings)}/ano
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  Sob consulta
                </div>
              )}
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        {/* Features */}
        <ul className="space-y-2 flex-1">
          {features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start gap-2 text-sm">
              <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isDashboard ? 'text-primary' : 'text-secondary'}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        {renderCTA()}
      </CardContent>
    </Card>
  );
};
