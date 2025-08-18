import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface EngagementData {
  pageViews: number;
  timeSpent: number;
  meaningfulActions: number;
  firstVisitTime: number;
  lastActionTime: number;
}

const ENGAGEMENT_THRESHOLDS = {
  MIN_PAGE_VIEWS: 2,
  MIN_TIME_SPENT: 30000, // 30 seconds in milliseconds
  MIN_MEANINGFUL_ACTIONS: 1,
};

const STORAGE_KEY = 'user-engagement';

export const useEngagementTracker = () => {
  const location = useLocation();
  const [engagement, setEngagement] = useState<EngagementData>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      pageViews: 0,
      timeSpent: 0,
      meaningfulActions: 0,
      firstVisitTime: Date.now(),
      lastActionTime: Date.now(),
    };
  });

  // Track time spent on site
  useEffect(() => {
    const startTime = Date.now();
    let timeInterval: NodeJS.Timeout;

    const updateTimeSpent = () => {
      const currentTime = Date.now();
      setEngagement(prev => {
        const updated = {
          ...prev,
          timeSpent: prev.timeSpent + (currentTime - startTime),
          lastActionTime: currentTime,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    // Update time every 5 seconds while page is active
    timeInterval = setInterval(updateTimeSpent, 5000);

    // Update time when user leaves or becomes inactive
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateTimeSpent();
        clearInterval(timeInterval);
      } else {
        timeInterval = setInterval(updateTimeSpent, 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      updateTimeSpent();
      clearInterval(timeInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track page views
  useEffect(() => {
    setEngagement(prev => {
      const updated = {
        ...prev,
        pageViews: prev.pageViews + 1,
        lastActionTime: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [location.pathname]);

  // Track meaningful actions
  const trackMeaningfulAction = useCallback((actionType: string) => {
    console.log(`Meaningful action tracked: ${actionType}`);
    setEngagement(prev => {
      const updated = {
        ...prev,
        meaningfulActions: prev.meaningfulActions + 1,
        lastActionTime: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Check if user is engaged enough for PWA prompt
  const isEngaged = useCallback(() => {
    return (
      engagement.pageViews >= ENGAGEMENT_THRESHOLDS.MIN_PAGE_VIEWS ||
      engagement.timeSpent >= ENGAGEMENT_THRESHOLDS.MIN_TIME_SPENT ||
      engagement.meaningfulActions >= ENGAGEMENT_THRESHOLDS.MIN_MEANINGFUL_ACTIONS
    );
  }, [engagement]);

  // Check if cookie consent is still active
  const isCookieConsentActive = useCallback(() => {
    return !localStorage.getItem('cookieConsent');
  }, []);

  return {
    engagement,
    isEngaged,
    isCookieConsentActive,
    trackMeaningfulAction,
    thresholds: ENGAGEMENT_THRESHOLDS,
  };
};