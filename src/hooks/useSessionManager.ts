import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionSettings {
  rememberMe: boolean;
  sessionTimeout: number; // in milliseconds
  warningTime: number; // when to show warning before timeout
}

const DEFAULT_SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export const useSessionManager = () => {
  const { toast } = useToast();
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    rememberMe: false,
    sessionTimeout: DEFAULT_SESSION_TIMEOUT,
    warningTime: WARNING_TIME
  });
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(0);

  // Load session settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('session-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading session settings:', error);
      }
    }
  }, []);

  // Save session settings to localStorage
  const saveSettings = useCallback((settings: Partial<SessionSettings>) => {
    const newSettings = { ...sessionSettings, ...settings };
    setSessionSettings(newSettings);
    localStorage.setItem('session-settings', JSON.stringify(newSettings));
  }, [sessionSettings]);

  // Set remember me preference
  const setRememberMe = useCallback((remember: boolean) => {
    const timeout = remember ? REMEMBER_ME_TIMEOUT : DEFAULT_SESSION_TIMEOUT;
    saveSettings({ 
      rememberMe: remember, 
      sessionTimeout: timeout 
    });
  }, [saveSettings]);

  // Session timeout logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;
    let countdownId: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      clearTimeout(countdownId);
      setShowTimeoutWarning(false);
      setTimeoutCountdown(0);

      // Set warning timer
      warningId = setTimeout(() => {
        setShowTimeoutWarning(true);
        setTimeoutCountdown(sessionSettings.warningTime);
        
        // Start countdown
        countdownId = setInterval(() => {
          setTimeoutCountdown(prev => {
            if (prev <= 1000) {
              handleSessionTimeout();
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);

        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${Math.ceil(sessionSettings.warningTime / (60 * 1000))} minutes. Activity detected to extend session.`
        });
      }, sessionSettings.sessionTimeout - sessionSettings.warningTime);

      // Set timeout timer
      timeoutId = setTimeout(handleSessionTimeout, sessionSettings.sessionTimeout);
    };

    const handleSessionTimeout = async () => {
      setShowTimeoutWarning(false);
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      
      await supabase.auth.signOut();
    };

    // Track user activity to reset timers
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const resetOnActivity = () => {
      if (!showTimeoutWarning) {
        resetTimers();
      }
    };

    activities.forEach(activity => {
      document.addEventListener(activity, resetOnActivity, true);
    });

    // Initial timer setup
    resetTimers();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      clearTimeout(countdownId);
      activities.forEach(activity => {
        document.removeEventListener(activity, resetOnActivity, true);
      });
    };
  }, [sessionSettings.sessionTimeout, sessionSettings.warningTime, showTimeoutWarning, toast]);

  const extendSession = useCallback(async () => {
    try {
      // Refresh the session
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setShowTimeoutWarning(false);
      setTimeoutCountdown(0);
      
      toast({
        title: "Session Extended",
        description: "Your session has been successfully extended.",
      });
    } catch (error) {
      console.error('Error extending session:', error);
      toast({
        title: "Extension Failed",
        description: "Could not extend session. Please sign in again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const signOutAllDevices = useCallback(async () => {
    try {
      // Sign out from all devices by updating the user's auth timestamp
      // This will invalidate all existing sessions
      const { error } = await supabase.auth.updateUser({
        data: { sign_out_all_devices: Date.now() }
      });
      
      if (error) throw error;
      
      // Sign out locally
      await supabase.auth.signOut();
      
      toast({
        title: "Signed Out",
        description: "You have been signed out from all devices.",
      });
    } catch (error) {
      console.error('Error signing out from all devices:', error);
      toast({
        title: "Sign Out Failed",
        description: "Could not sign out from all devices. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getCountdownFormatted = useCallback(() => {
    const minutes = Math.floor(timeoutCountdown / (60 * 1000));
    const seconds = Math.floor((timeoutCountdown % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeoutCountdown]);

  return {
    sessionSettings,
    showTimeoutWarning,
    timeoutCountdown: getCountdownFormatted(),
    setRememberMe,
    extendSession,
    signOutAllDevices
  };
};