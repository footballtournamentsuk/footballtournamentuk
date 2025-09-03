// Speed Index optimizations for faster visual rendering

// Preload critical above-the-fold resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    // Hero images (critical for Speed Index)
    { href: '/hero-celebration-desktop.webp', as: 'image', type: 'image/webp' },
    { href: '/hero-celebration-mobile.webp', as: 'image', type: 'image/webp' },
    
    // Critical CSS and fonts
    { href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', as: 'font', type: 'font/woff2' },
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.as === 'font') link.crossOrigin = 'anonymous';
    
    // Set high priority for critical resources
    if (link.fetchPriority) {
      (link as any).fetchPriority = 'high';
    }
    
    document.head.appendChild(link);
  });
};

// Progressive image loading for Speed Index
export const createProgressiveImageLoader = () => {
  const loadImage = (src: string, placeholder?: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Load placeholder first if provided
      if (placeholder) {
        const placeholderImg = new Image();
        placeholderImg.onload = () => {
          // Placeholder loaded, now load full image
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        };
        placeholderImg.src = placeholder;
      } else {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      }
    });
  };

  return { loadImage };
};

// Optimize critical rendering path
export const optimizeCriticalRenderingPath = () => {
  // Remove render-blocking resources
  const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  nonCriticalCSS.forEach(link => {
    // Convert to non-blocking load
    link.setAttribute('media', 'print');
    link.addEventListener('load', () => {
      link.removeAttribute('media');
    });
  });

  // Defer non-critical JavaScript
  const scripts = document.querySelectorAll('script[src]:not([data-critical])');
  scripts.forEach(script => {
    if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
      script.setAttribute('defer', '');
    }
  });
};

// Minimize layout shifts for better Speed Index
export const preventLayoutShifts = () => {
  // Add minimal CSS to prevent only critical layout shifts
  const preventShiftCSS = `
    /* Prevent layout shifts for images only */
    img, video {
      height: auto;
      max-width: 100%;
    }
  `;

  const style = document.createElement('style');
  style.textContent = preventShiftCSS;
  document.head.appendChild(style);
};

// Initialize Speed Index optimizations
export const initSpeedIndexOptimizations = () => {
  // Run critical optimizations immediately
  preloadCriticalResources();
  preventLayoutShifts();
  
  // Optimize rendering path after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeCriticalRenderingPath);
  } else {
    optimizeCriticalRenderingPath();
  }
};