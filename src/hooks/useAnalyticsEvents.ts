import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  properties: Record<string, any>;
  user_id?: string | null;
  session_id: string;
}

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Track analytics event
export const trackEvent = async (eventName: string, properties: Record<string, any> = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const event: AnalyticsEvent = {
      event_name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        pathname: window.location.pathname,
      },
      user_id: user?.id || null,
      session_id: getSessionId(),
    };

    // Insert into analytics_events table
    const { error } = await supabase
      .from('analytics_events')
      .insert(event);

    if (error) {
      console.warn('Failed to track analytics event:', error);
    } else {
      console.log(`📊 Analytics event tracked: ${eventName}`, properties);
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
};

// PWA-specific event tracking functions
export const trackPWAPromptShown = (trigger: 'automatic' | 'manual' = 'automatic') => {
  trackEvent('pwa_prompt_shown', {
    trigger,
    engagement_data: JSON.parse(sessionStorage.getItem('user-engagement') || '{}'),
  });
};

export const trackPWAInstalled = (timeFromPrompt?: number) => {
  trackEvent('pwa_installed', {
    time_from_prompt: timeFromPrompt,
    install_source: 'web_app_manifest',
  });
};

export const trackPWAPromptDismissed = (reason: 'user_dismissed' | 'auto_dismissed' = 'user_dismissed') => {
  trackEvent('pwa_prompt_dismissed', {
    dismissal_reason: reason,
  });
};

// User activity tracking (for retention calculation)
export const trackUserActivity = () => {
  trackEvent('user_activity', {
    page_views: JSON.parse(sessionStorage.getItem('user-engagement') || '{}').pageViews || 0,
  });
};

// Funnel tracking functions
export const trackTournamentListView = (filters: Record<string, any> = {}) => {
  trackEvent('tournament_list_view', {
    filters_applied: filters,
    results_count: filters.results_count || 0,
  });
};

export const trackTournamentDetailView = (tournamentId: string, tournamentName?: string) => {
  trackEvent('tournament_detail_view', {
    tournament_id: tournamentId,
    tournament_name: tournamentName,
  });
};

export const trackRegistrationStart = (tournamentId: string, registrationMethod?: string) => {
  trackEvent('registration_start', {
    tournament_id: tournamentId,
    registration_method: registrationMethod || 'contact_organizer',
  });
};

export const trackRegistrationComplete = (tournamentId: string, completionMethod?: string) => {
  trackEvent('registration_complete', {
    tournament_id: tournamentId,
    completion_method: completionMethod || 'contact_sent',
  });
};

// Performance tracking functions
export const trackCoreWebVitals = (metrics: { lcp?: number; fid?: number; cls?: number }) => {
  trackEvent('core_web_vitals', {
    lcp: metrics.lcp,
    fid: metrics.fid,
    cls: metrics.cls,
    connection_type: (navigator as any).connection?.effectiveType || 'unknown',
  });
};

export const trackAPICall = (endpoint: string, method: string, duration: number, success: boolean) => {
  trackEvent('api_call', {
    endpoint,
    method,
    duration_ms: duration,
    success,
    status_category: success ? 'success' : 'error',
  });
};

// Hook for automatic page view tracking
export const usePageTracking = () => {
  const trackPageView = (pathname: string) => {
    trackEvent('page_view', {
      pathname,
      referrer: document.referrer,
    });
  };

  return { trackPageView };
};