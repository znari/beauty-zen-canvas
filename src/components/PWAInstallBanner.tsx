import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";

const BANNER_DISMISSED_KEY = "pwa-install-banner-dismissed";

export const PWAInstallBanner = () => {
  const [isDismissed, setIsDismissed] = useState(true);
  const { canInstall, isInstalled, isIOS } = usePWAInstall();
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed && (canInstall || isIOS) && !isInstalled) {
      setIsDismissed(false);
    }
  }, [canInstall, isIOS, isInstalled]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  const handleInstallClick = () => {
    navigate("/instalar");
  };

  if (isDismissed || isInstalled || (!canInstall && !isIOS)) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Download className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Instale o FichaZen</span> no seu dispositivo para acesso rápido
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="whitespace-nowrap"
            >
              Instalar App
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
