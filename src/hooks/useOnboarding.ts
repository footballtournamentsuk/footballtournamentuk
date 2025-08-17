import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const ONBOARDING_STORAGE_KEY = 'ftuk_onboarding_completed';

export const useOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    // Only check onboarding status when we have user data and profile data is loaded
    if (authLoading || profileLoading || !user) return;

    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    
    // Show onboarding if:
    // 1. User hasn't completed onboarding before (localStorage check)
    // 2. User is authenticated
    // 3. This is their first time (no profile exists or profile was just created)
    if (!hasCompletedOnboarding && user && !profile) {
      setShouldShowOnboarding(true);
      setIsOnboardingOpen(true);
    }
  }, [user, profile, authLoading, profileLoading]);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShouldShowOnboarding(false);
    setIsOnboardingOpen(false);
  };

  const openOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    completeOnboarding();
  };

  return {
    shouldShowOnboarding,
    isOnboardingOpen,
    openOnboarding,
    closeOnboarding,
    completeOnboarding
  };
};