import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePublicAvatarUrl = (avatarPath: string | null | undefined) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!avatarPath) {
        setAvatarUrl(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from("profile-avatars")
          .createSignedUrl(avatarPath, 3600); // 1 hour

        if (error) {
          console.error("Error fetching avatar URL:", error);
          setAvatarUrl(null);
        } else {
          setAvatarUrl(data?.signedUrl || null);
        }
      } catch (err) {
        console.error("Error:", err);
        setAvatarUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [avatarPath]);

  return { avatarUrl, isLoading };
};
