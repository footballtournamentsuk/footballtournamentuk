// Critical CSS utilities for performance optimization

export const injectCriticalCSS = () => {
  // This function can be used to inject additional critical CSS dynamically
  // The main critical CSS is already inlined in index.html
  
  const criticalStyles = `
    /* Performance-critical animations */
    .hero-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .8;
      }
    }
    
    /* Critical layout styles */
    .loading-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `;

  // Only inject if not already present
  if (!document.querySelector('#critical-animations')) {
    const style = document.createElement('style');
    style.id = 'critical-animations';
    style.textContent = criticalStyles;
    document.head.appendChild(style);
  }
};

// Font loading optimization with better error handling
export const optimizeFontLoading = () => {
  // Use font-display: swap and preload for critical fonts
  if ('fonts' in document && 'FontFace' in window) {
    const loadFont = async () => {
      try {
        const font = new FontFace(
          'Inter', 
          'url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)',
          { 
            display: 'swap',
            weight: '400 700',
            style: 'normal'
          }
        );
        
        await font.load();
        document.fonts.add(font);
      } catch (err) {
        // Silently fail and use fallback system fonts
        console.warn('Font loading failed, using fallback:', err);
      }
    };

    // Load font after critical content
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadFont);
    } else {
      setTimeout(loadFont, 100);
    }
  }
};

// Preload next route's critical resources
export const preloadRouteResources = (route: string) => {
  const routeResources: Record<string, string[]> = {
    '/tournaments': ['/src/assets/tournaments/tournament-type.webp'],
    '/city/london': ['/src/assets/cities/london-hero.webp'],
    '/city/manchester': ['/src/assets/cities/manchester-hero.webp'],
    // Add more routes as needed
  };

  const resources = routeResources[route];
  if (resources) {
    resources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }
};