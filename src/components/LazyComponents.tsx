// Lazy-loaded components for better performance
import React, { lazy } from 'react';

// Lazy load heavy components that are not critical for initial page load
export const LazyMap = lazy(() => import('@/components/Map'));
export const LazyTournamentFilters = lazy(() => import('@/components/TournamentFilters'));
export const LazyPartnersCarousel = lazy(() => import('@/components/PartnersCarousel'));
export const LazyCookieConsent = lazy(() => import('@/components/CookieConsent').then(module => ({ default: module.CookieConsent })));

// Higher-order component for adding loading fallback
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = <div className="h-32 bg-muted animate-pulse rounded-lg" />
) => {
  return (props: P) => (
    <React.Suspense fallback={fallback}>
      <Component {...props} />
    </React.Suspense>
  );
};