import { useEffect } from 'react';

interface CriticalResource {
  href: string;
  as: 'image' | 'font' | 'script' | 'style';
  type?: string;
  crossorigin?: boolean;
}

export const usePreloadCriticalResources = (resources: CriticalResource[]) => {
  useEffect(() => {
    const preloadedLinks: HTMLLinkElement[] = [];

    resources.forEach(resource => {
      // Check if already preloaded
      const existing = document.querySelector(`link[rel="preload"][href="${resource.href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossorigin) {
        link.crossOrigin = 'anonymous';
      }

      // Add high fetchpriority for critical resources
      if (resource.as === 'image') {
        link.setAttribute('fetchpriority', 'high');
      }

      document.head.appendChild(link);
      preloadedLinks.push(link);
    });

    // Cleanup on unmount
    return () => {
      preloadedLinks.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [resources]);
};

// Hook for preloading hero images based on route
export const usePreloadHeroImages = (currentRoute?: string) => {
  const getCriticalImages = (): CriticalResource[] => {
    const baseImages: CriticalResource[] = [
      { href: '/src/assets/hero-football.webp', as: 'image' }
    ];

    // Add city-specific images based on route
    if (currentRoute?.includes('/city/')) {
      const cityName = currentRoute.split('/city/')[1];
      baseImages.push({
        href: `/src/assets/cities/${cityName}-hero.webp`,
        as: 'image'
      });
    }

    // Preload tournament type images for better performance
    const tournamentTypeImages = [
      '/src/assets/tournaments/tournament-type.webp',
      '/src/assets/tournaments/league-type.webp',
      '/src/assets/tournaments/camp-type.webp',
      '/src/assets/tournaments/cup-type.webp',
      '/src/assets/tournaments/festival-type.webp',
      '/src/assets/tournaments/showcase-type.webp',
      '/src/assets/tournaments/holiday-type.webp',
    ];

    tournamentTypeImages.forEach(imagePath => {
      baseImages.push({ href: imagePath, as: 'image' });
    });

    return baseImages;
  };

  usePreloadCriticalResources(getCriticalImages());
};