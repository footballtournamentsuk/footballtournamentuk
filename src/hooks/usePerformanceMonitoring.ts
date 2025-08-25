import { useEffect } from 'react';
import { trackCoreWebVitals } from '@/hooks/useAnalyticsEvents';

interface PerformanceMetrics {
  lcp?: number;
  fcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
}

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const measureWebVitals = async () => {
      try {
        const { onLCP, onFCP, onCLS, onTTFB } = await import('web-vitals');
        
        const metrics: PerformanceMetrics = {};
        
        onLCP((metric) => {
          metrics.lcp = metric.value;
          trackCoreWebVitals({ lcp: metric.value });
          console.log('LCP:', metric.value, 'ms');
        });
        
        onFCP((metric) => {
          metrics.fcp = metric.value;
          console.log('FCP:', metric.value, 'ms');
        });
        
        onCLS((metric) => {
          metrics.cls = metric.value;
          trackCoreWebVitals({ cls: metric.value });
          console.log('CLS:', metric.value);
        });
        
        
        onTTFB((metric) => {
          metrics.ttfb = metric.value;
          console.log('TTFB:', metric.value, 'ms');
        });
        
        // Log summary after 5 seconds
        setTimeout(() => {
          console.log('Performance Summary:', metrics);
          
          // Check if metrics meet targets
          const targets = {
            lcp: 2500,  // 2.5s
            fcp: 1800,  // 1.8s
            cls: 0.1,   // 0.1
            fid: 100,   // 100ms
            ttfb: 800   // 800ms
          };
          
          Object.entries(metrics).forEach(([key, value]) => {
            const target = targets[key as keyof typeof targets];
            const status = value && value <= target ? '✅' : '❌';
            console.log(`${key.toUpperCase()}: ${value}ms ${status} (target: ≤${target}${key === 'cls' ? '' : 'ms'})`);
          });
        }, 5000);
        
      } catch (error) {
        console.warn('Performance monitoring failed:', error);
      }
    };

    // Delay measurement to avoid affecting initial load
    if ('requestIdleCallback' in window) {
      requestIdleCallback(measureWebVitals);
    } else {
      setTimeout(measureWebVitals, 1000);
    }
  }, []);
  
  // Monitor resource loading performance
  useEffect(() => {
    const logResourceTiming = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        // Focus on critical resources
        const criticalResources = resources.filter(resource => 
          resource.name.includes('hero-celebration') ||
          resource.name.includes('main.tsx') ||
          resource.name.includes('index.css')
        );
        
        criticalResources.forEach(resource => {
          console.log(`Resource: ${resource.name.split('/').pop()}`, {
            duration: Math.round(resource.duration),
            size: resource.transferSize,
            cached: resource.transferSize === 0
          });
        });
      }
    };
    
    window.addEventListener('load', () => {
      setTimeout(logResourceTiming, 1000);
    });
  }, []);
};

// Helper to measure component render time
export const measureComponentRender = (componentName: string) => {
  return {
    start: () => performance.mark(`${componentName}-start`),
    end: () => {
      performance.mark(`${componentName}-end`);
      performance.measure(componentName, `${componentName}-start`, `${componentName}-end`);
      
      const measurement = performance.getEntriesByName(componentName)[0];
      console.log(`${componentName} render time:`, Math.round(measurement.duration), 'ms');
    }
  };
};