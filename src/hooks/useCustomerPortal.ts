import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomerPortal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const openCustomerPortal = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;
      if (!data?.url) throw new Error("Não foi possível criar a sessão do portal");

      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Erro ao abrir portal de gerenciamento");
    } finally {
      setIsLoading(false);
    }
  };

  return { openCustomerPortal, isLoading };
};
