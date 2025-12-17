import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const REFERRAL_STORAGE_KEY = 'fichazen_referral_code';

export const saveReferralCode = (code: string) => {
  localStorage.setItem(REFERRAL_STORAGE_KEY, code.toUpperCase());
};

export const getReferralCode = (): string | null => {
  return localStorage.getItem(REFERRAL_STORAGE_KEY);
};

export const clearReferralCode = () => {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
};

export const validateReferralCode = async (code: string): Promise<{ valid: boolean; partnerName?: string }> => {
  const { data, error } = await supabase.rpc('validate_referral_code', { p_code: code });
  
  if (error || !data) return { valid: false };
  const result = data as unknown as { valid: boolean; partner_name?: string };
  return { valid: result.valid, partnerName: result.partner_name };
};

export const registerReferral = async (userId: string, userEmail: string): Promise<boolean> => {
  const code = getReferralCode();
  if (!code) return false;

  const { data, error } = await supabase.rpc('register_referral', {
    p_user_id: userId,
    p_user_email: userEmail,
    p_referral_code: code,
  });

  const result = data as unknown as { success: boolean } | null;
  if (error || !result?.success) {
    console.error('Failed to register referral:', error);
    return false;
  }

  clearReferralCode();
  return true;
};

export const useReferralTracking = () => {
  useEffect(() => {
    // Check URL for referral code on mount
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      saveReferralCode(refCode);
    }
  }, []);

  return {
    saveReferralCode,
    getReferralCode,
    clearReferralCode,
    validateReferralCode,
    registerReferral,
  };
};
