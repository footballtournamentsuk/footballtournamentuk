import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionSettings {
  rememberMe: boolean;
  sessionTimeout: number; // in milliseconds
  warningTime: number; // when to show warning before timeout
}

const DEFAULT_SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour of inactivity
const REMEMBER_ME_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days for remember me
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
const ACTIVITY_CHECK_INTERVAL = 30 * 1000; // Check activity every 30 seconds

export const useSessionManager = () => {
  const { toast } = useToast();
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    rememberMe: false,
    sessionTimeout: DEFAULT_SESSION_TIMEOUT,
    warningTime: WARNING_TIME
  });
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

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

  // Track user activity
  useEffect(() => {
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    activities.forEach(activity => {
      document.addEventListener(activity, updateActivity, true);
    });

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, updateActivity, true);
      });
    };
  }, []);

  // Session monitoring logic - check periodically instead of aggressive timers
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;
    let countdownId: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        // Check Supabase session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Session is invalid in Supabase, don't show timeout warning
          return;
        }

        const now = Date.now();
        const timeSinceActivity = now - lastActivity;
        const timeUntilTimeout = sessionSettings.sessionTimeout - timeSinceActivity;
        
        // Only proceed with timeout logic if we have a valid session
        if (timeUntilTimeout <= sessionSettings.warningTime && timeUntilTimeout > 0) {
          if (!showTimeoutWarning) {
            setShowTimeoutWarning(true);
            setTimeoutCountdown(timeUntilTimeout);
            
            // Start countdown
            countdownId = setInterval(() => {
              setTimeoutCountdown(prev => {
                const newCountdown = prev - 1000;
                if (newCountdown <= 0) {
                  handleSessionTimeout();
                  return 0;
                }
                return newCountdown;
              });
            }, 1000);

            toast({
              title: "Session Expiring Soon",
              description: `Your session will expire due to inactivity in ${Math.ceil(timeUntilTimeout / (60 * 1000))} minutes.`,
              variant: "destructive"
            });
          }
        } else if (timeUntilTimeout <= 0) {
          handleSessionTimeout();
        } else if (showTimeoutWarning && timeUntilTimeout > sessionSettings.warningTime) {
          // User became active again, cancel warning
          setShowTimeoutWarning(false);
          setTimeoutCountdown(0);
          clearInterval(countdownId);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    const handleSessionTimeout = async () => {
      clearInterval(countdownId);
      setShowTimeoutWarning(false);
      setTimeoutCountdown(0);
      
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please sign in again.",
        variant: "destructive",
      });
      
      await supabase.auth.signOut();
    };

    // Check session periodically
    intervalId = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);
    
    // Initial check
    checkSession();

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
      clearTimeout(warningId);
    };
  }, [lastActivity, sessionSettings.sessionTimeout, sessionSettings.warningTime, showTimeoutWarning, toast]);

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