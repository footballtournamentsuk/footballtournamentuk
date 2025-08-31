// Time to Interactive optimizations
import { prefetchRoute } from './performance';

// Defer heavy operations until after TTI
export const deferHeavyOperations = () => {
  // Batch DOM operations
  const deferredDOMTasks: (() => void)[] = [];
  
  const processDeferredTasks = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        deferredDOMTasks.forEach(task => task());
        deferredDOMTasks.length = 0;
      }, { timeout: 5000 });
    }
  };

  // Defer non-critical prefetching
  setTimeout(() => {
    processDeferredTasks();
    
    // Prefetch routes only after TTI
    ['tournaments', '/about', '/how-it-works'].forEach(route => {
      prefetchRoute(route);
    });
  }, 8000);
};

// Reduce main thread blocking during initial load
export const optimizeMainThread = () => {
  // Break up heavy synchronous work
  const yieldToMain = () => {
    return new Promise(resolve => {
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(resolve, { priority: 'background' });
      } else if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });
  };

  return { yieldToMain };
};

// Lazy load heavy components only when needed
export const createIntersectionLoader = () => {
  const observers = new Map<Element, () => void>();
  
  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const callback = observers.get(entry.target);
        if (callback) {
          // Delay execution to avoid blocking scroll
          requestAnimationFrame(() => {
            setTimeout(callback, 16);
          });
          observers.delete(entry.target);
          intersectionObserver.unobserve(entry.target);
        }
      }
    });
  }, {
    rootMargin: '100px 0px',
    threshold: 0.01
  });

  return {
    observe: (element: Element, callback: () => void) => {
      observers.set(element, callback);
      intersectionObserver.observe(element);
    },
    disconnect: () => intersectionObserver.disconnect()
  };
};