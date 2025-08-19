import { useEffect } from 'react';
import { trackCoreWebVitals } from '@/hooks/useAnalyticsEvents';

export const useCoreWebVitals = () => {
  useEffect(() => {
    // Track Core Web Vitals using the web-vitals library  
    const trackVitals = async () => {
      try {
        // Use dynamic import to load web-vitals
        const webVitals = await import('web-vitals');
        
        webVitals.onCLS((metric) => {
          trackCoreWebVitals({ cls: metric.value });
        });
        
        webVitals.onLCP((metric) => {
          trackCoreWebVitals({ lcp: metric.value });
        });
      } catch (error) {
        console.warn('Core Web Vitals tracking failed:', error);
      }
    };

    trackVitals();
  }, []);
};