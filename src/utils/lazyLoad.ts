// Lazy loading utilities for performance optimization
import React from 'react';

// Intersection Observer for lazy loading
export const createLazyObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.01,
  });
};

// Lazy load images with placeholder
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const observer = createLazyObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        target.src = src;
        target.classList.remove('loading');
        observer.unobserve(target);
      }
    });
  });

  img.classList.add('loading');
  observer.observe(img);
};

// Component lazy loading with dynamic imports
export const createLazyComponent = <T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) => {
  return React.lazy(componentImport);
};

// Lazy load non-critical scripts
export const lazyLoadScript = (src: string, condition?: () => boolean) => {
  if (condition && !condition()) return;

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.defer = true;
  
  // Load after user interaction or timeout
  const loadScript = () => {
    document.head.appendChild(script);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadScript, { timeout: 3000 });
  } else {
    setTimeout(loadScript, 3000);
  }
};

// Preload critical resources with high priority
export const preloadCriticalResource = (href: string, as: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
};