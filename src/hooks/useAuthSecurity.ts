import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AuthAttempt {
  timestamp: number;
  action: 'signin' | 'signup' | 'reset';
}

interface SecurityState {
  attempts: AuthAttempt[];
  isLocked: boolean;
  lockUntil?: number;
  remainingTime?: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour window

export const useAuthSecurity = () => {
  const { toast } = useToast();
  const [securityState, setSecurityState] = useState<SecurityState>({
    attempts: [],
    isLocked: false
  });

  // Load security state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth-security');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        
        // Clean old attempts
        const recentAttempts = parsed.attempts.filter(
          (attempt: AuthAttempt) => now - attempt.timestamp < ATTEMPT_WINDOW
        );
        
        // Check if still locked
        const isLocked = parsed.lockUntil && now < parsed.lockUntil;
        const remainingTime = isLocked ? parsed.lockUntil - now : undefined;
        
        setSecurityState({
          attempts: recentAttempts,
          isLocked: !!isLocked,
          lockUntil: parsed.lockUntil,
          remainingTime
        });
      } catch (error) {
        console.error('Error loading auth security state:', error);
      }
    }
  }, []);

  // Save security state to localStorage
  const saveState = useCallback((state: SecurityState) => {
    localStorage.setItem('auth-security', JSON.stringify({
      attempts: state.attempts,
      lockUntil: state.lockUntil
    }));
  }, []);

  // Update remaining time every second when locked
  useEffect(() => {
    if (!securityState.isLocked || !securityState.lockUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = securityState.lockUntil! - now;
      
      if (remaining <= 0) {
        setSecurityState(prev => ({
          ...prev,
          isLocked: false,
          lockUntil: undefined,
          remainingTime: undefined
        }));
      } else {
        setSecurityState(prev => ({
          ...prev,
          remainingTime: remaining
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [securityState.isLocked, securityState.lockUntil]);

  const recordAttempt = useCallback((action: 'signin' | 'signup' | 'reset') => {
    const now = Date.now();
    
    setSecurityState(prev => {
      // Clean old attempts
      const recentAttempts = prev.attempts.filter(
        attempt => now - attempt.timestamp < ATTEMPT_WINDOW
      );
      
      // Add new attempt
      const newAttempts = [...recentAttempts, { timestamp: now, action }];
      
      // Check if should be locked
      const shouldLock = newAttempts.length >= MAX_ATTEMPTS;
      const lockUntil = shouldLock ? now + LOCKOUT_DURATION : undefined;
      
      const newState = {
        attempts: newAttempts,
        isLocked: shouldLock,
        lockUntil,
        remainingTime: shouldLock ? LOCKOUT_DURATION : undefined
      };
      
      saveState(newState);
      
      if (shouldLock) {
        toast({
          title: "Account Temporarily Locked",
          description: "Too many failed attempts. Please try again in 15 minutes.",
          variant: "destructive",
        });
      }
      
      return newState;
    });
  }, [saveState, toast]);

  const checkSecurity = useCallback(() => {
    if (securityState.isLocked) {
      const minutes = Math.ceil((securityState.remainingTime || 0) / (60 * 1000));
      toast({
        title: "Account Locked",
        description: `Please wait ${minutes} minute(s) before trying again.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [securityState.isLocked, securityState.remainingTime, toast]);

  const clearAttempts = useCallback(() => {
    setSecurityState({
      attempts: [],
      isLocked: false
    });
    localStorage.removeItem('auth-security');
  }, []);

  const getRemainingTimeFormatted = useCallback(() => {
    if (!securityState.remainingTime) return '';
    
    const minutes = Math.floor(securityState.remainingTime / (60 * 1000));
    const seconds = Math.floor((securityState.remainingTime % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [securityState.remainingTime]);

  return {
    isLocked: securityState.isLocked,
    attemptCount: securityState.attempts.length,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - securityState.attempts.length),
    remainingTime: getRemainingTimeFormatted(),
    recordAttempt,
    checkSecurity,
    clearAttempts
  };
};