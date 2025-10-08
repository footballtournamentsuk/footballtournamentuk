// Google Analytics 4 tracking utilities
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize GA4 with gtag.js
export const initGA4 = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll send manually for SPA
    cookie_flags: 'SameSite=None;Secure'
  });
};

// Track page view
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });
};

// Track custom event
export const trackGA4Event = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, params);
};

// Track conversions
export const trackConversion = (conversionName: string, value?: number, currency: string = 'GBP') => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: conversionName,
    value: value,
    currency: currency
  });
};

// E-commerce tracking
export const trackTournamentRegistration = (tournamentId: string, tournamentName: string, value?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'tournament_registration', {
    tournament_id: tournamentId,
    tournament_name: tournamentName,
    value: value,
    currency: 'GBP'
  });
};

// User engagement tracking
export const trackUserEngagement = (engagementType: string, details?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'user_engagement', {
    engagement_type: engagementType,
    ...details
  });
};
