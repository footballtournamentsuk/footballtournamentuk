import { supabase } from '@/integrations/supabase/client';
import { trackGA4Event, trackPageView as ga4PageView, trackTournamentRegistration, trackUserEngagement } from '@/utils/ga4';

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

// Track analytics event to both Supabase and GA4
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

    // Insert into Supabase analytics_events table
    const { error } = await supabase
      .from('analytics_events')
      .insert(event as any);

    if (error) {
      console.warn('Failed to track analytics event:', error);
    } else {
      console.log(`📊 Analytics event tracked: ${eventName}`, properties);
    }

    // Also track to GA4
    trackGA4Event(eventName, properties);
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
  trackUserEngagement('pwa_interaction', { action: 'prompt_shown', trigger });
};

export const trackPWAInstalled = (timeFromPrompt?: number) => {
  trackEvent('pwa_installed', {
    time_from_prompt: timeFromPrompt,
    install_source: 'web_app_manifest',
  });
  trackGA4Event('install', { method: 'pwa', time_from_prompt_ms: timeFromPrompt });
};

export const trackPWAPromptDismissed = (reason: 'user_dismissed' | 'auto_dismissed' = 'user_dismissed') => {
  trackEvent('pwa_prompt_dismissed', {
    dismissal_reason: reason,
  });
  trackUserEngagement('pwa_interaction', { action: 'dismissed', reason });
};

// User activity tracking (for retention calculation)
export const trackUserActivity = () => {
  trackEvent('user_activity', {
    page_views: JSON.parse(sessionStorage.getItem('user-engagement') || '{}').pageViews || 0,
  });
  trackUserEngagement('active', {});
};

// Funnel tracking functions
export const trackTournamentListView = (filters: Record<string, any> = {}) => {
  trackEvent('tournament_list_view', {
    filters_applied: filters,
    results_count: filters.results_count || 0,
  });
  trackGA4Event('view_item_list', { item_list_name: 'tournaments', filters });
};

export const trackTournamentDetailView = (tournamentId: string, tournamentName?: string) => {
  trackEvent('tournament_detail_view', {
    tournament_id: tournamentId,
    tournament_name: tournamentName,
  });
  trackGA4Event('view_item', { 
    item_id: tournamentId, 
    item_name: tournamentName,
    item_category: 'tournament'
  });
};

export const trackRegistrationStart = (tournamentId: string, registrationMethod?: string) => {
  trackEvent('registration_start', {
    tournament_id: tournamentId,
    registration_method: registrationMethod || 'contact_organizer',
  });
  trackGA4Event('begin_checkout', { 
    tournament_id: tournamentId, 
    method: registrationMethod 
  });
};

export const trackRegistrationComplete = (tournamentId: string, completionMethod?: string) => {
  trackEvent('registration_complete', {
    tournament_id: tournamentId,
    completion_method: completionMethod || 'contact_sent',
  });
  trackTournamentRegistration(tournamentId, 'Tournament Registration', undefined);
};

// Performance tracking functions
export const trackCoreWebVitals = (metrics: { lcp?: number; fid?: number; cls?: number }) => {
  trackEvent('core_web_vitals', {
    lcp: metrics.lcp,
    fid: metrics.fid,
    cls: metrics.cls,
    connection_type: (navigator as any).connection?.effectiveType || 'unknown',
  });
  trackGA4Event('web_vitals', {
    metric_lcp: metrics.lcp,
    metric_fid: metrics.fid,
    metric_cls: metrics.cls
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
  const trackPageView = (pathname: string, title?: string) => {
    trackEvent('page_view', {
      pathname,
      referrer: document.referrer,
    });
    
    // Also track to GA4
    ga4PageView(pathname, title);
  };

  return { trackPageView };
};
