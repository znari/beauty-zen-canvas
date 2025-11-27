import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-destructive text-destructive-foreground">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <p className="text-sm font-medium">
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </p>
        </div>
      </div>
    </div>
  );
};
