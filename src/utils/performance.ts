// Performance optimization utilities

// Resource prioritization
export const loadCriticalCSS = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  document.head.appendChild(link);
};

// Defer non-critical JavaScript
export const deferScript = (src: string, async = true) => {
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  if (async) script.async = true;
  document.head.appendChild(script);
};

// Image optimization helper
export const generateResponsiveImageSizes = (width: number) => {
  const sizes = [400, 800, 1200, 1600].filter(size => size <= width * 2);
  return sizes.map(size => `${size}w`).join(', ');
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      return registration;
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

// Prefetch next page resources
export const prefetchRoute = (route: string) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
};

// Critical resource hints
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const externalDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'yknmcddrfkggphrktivd.supabase.co'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
};

// Optimize third-party scripts
export const loadThirdPartyScripts = () => {
// Load analytics after LCP and significant user interaction
  const loadAfterLCP = () => {
    requestIdleCallback(() => {
      setTimeout(loadAnalytics, 2000);
    }, { timeout: 5000 });
  };
  
  if (document.readyState === 'complete') {
    loadAfterLCP();
  } else {
    window.addEventListener('load', loadAfterLCP);
  }
};

const loadAnalytics = () => {
  // Only load analytics if user has interacted and page is stable
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      deferScript('https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID');
    });
  }
};

// Font loading optimization
export const optimizeFonts = () => {
  // Add font-display: swap to improve FCP
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2') format('woff2');
    }
  `;
  document.head.appendChild(style);
};

// Memory cleanup utilities
export const cleanupResources = () => {
  // Clean up blob URLs
  const blobUrls = new Set<string>();
  
  return {
    addBlobUrl: (url: string) => blobUrls.add(url),
    cleanup: () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
      blobUrls.clear();
    }
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Bundle size analysis helper
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available at build time with --analyze flag');
  }
};