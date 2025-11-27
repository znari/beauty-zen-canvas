import { useEffect, useRef } from "react";
import { usePWAInstall } from "./usePWAInstall";
import { useCreatePWANotification } from "./useCreatePWANotification";
import { useAuth } from "@/contexts/AuthContext";

const FIRST_USAGE_KEY = "fichazen_first_usage_date";
const NOTIFICATION_CREATED_KEY = "fichazen_pwa_notification_created";
const DAYS_BEFORE_REMINDER = 3;

export const usePWAInstallReminder = () => {
  const { user } = useAuth();
  const { isInstalled } = usePWAInstall();
  const createNotification = useCreatePWANotification();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (hasChecked.current) return;
    
    // Need user to be logged in
    if (!user) return;

    // Don't remind if already installed
    if (isInstalled) return;

    // Check if notification was already created
    const notificationCreated = localStorage.getItem(NOTIFICATION_CREATED_KEY);
    if (notificationCreated === "true") return;

    // Get or set first usage date
    let firstUsageDate = localStorage.getItem(FIRST_USAGE_KEY);
    
    if (!firstUsageDate) {
      // First time using the app - save current date
      firstUsageDate = new Date().toISOString();
      localStorage.setItem(FIRST_USAGE_KEY, firstUsageDate);
      return; // Wait for 3 days
    }

    // Calculate days since first usage
    const firstDate = new Date(firstUsageDate);
    const now = new Date();
    const diffTime = now.getTime() - firstDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Check if 3+ days have passed
    if (diffDays >= DAYS_BEFORE_REMINDER) {
      hasChecked.current = true;
      
      // Create the notification
      createNotification.mutate(undefined, {
        onSuccess: (data) => {
          if (!data?.alreadyExists) {
            localStorage.setItem(NOTIFICATION_CREATED_KEY, "true");
          }
        },
      });
    }
  }, [user, isInstalled, createNotification]);
};
