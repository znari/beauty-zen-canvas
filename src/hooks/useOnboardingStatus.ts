import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingMetadata {
  onboarding_completed?: boolean;
  onboarding_skipped_at?: string;
  onboarding_completed_at?: string;
}

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("metadata, studio_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const metadata = (profile?.metadata as OnboardingMetadata) || {};
  const needsOnboarding =
    !metadata.onboarding_completed &&
    !metadata.onboarding_skipped_at &&
    profile?.studio_name; // Only show onboarding if profile exists

  const markOnboardingComplete = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const newMetadata = {
        ...(metadata || {}),
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update({ metadata: newMetadata as any })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const markOnboardingSkipped = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const newMetadata = {
        ...(metadata || {}),
        onboarding_skipped_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update({ metadata: newMetadata as any })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    needsOnboarding,
    onboardingCompleted: metadata.onboarding_completed || false,
    onboardingSkipped: !!metadata.onboarding_skipped_at,
    markOnboardingComplete: markOnboardingComplete.mutateAsync,
    markOnboardingSkipped: markOnboardingSkipped.mutateAsync,
  };
};
