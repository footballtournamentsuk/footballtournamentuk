// Lazy-loaded components for better performance and reduced TBT
import React, { lazy, Suspense } from 'react';
import { scheduleTask } from '@/utils/taskScheduler';

// Lazy load heavy components that contribute to TBT
export const LazyMap = lazy(() => 
  scheduleTask(() => import('@/components/Map'), { priority: 'background' })
);

export const LazyTournamentFilters = lazy(() => 
  scheduleTask(() => import('@/components/TournamentFilters'), { priority: 'background' })
);

export const LazyPartnersCarousel = lazy(() => 
  scheduleTask(() => import('@/components/PartnersCarousel'), { priority: 'background' })
);

export const LazyCookieConsent = lazy(() => 
  scheduleTask(() => import('@/components/CookieConsent').then(module => ({ default: module.CookieConsent })), { priority: 'background' })
);

// Admin components - very heavy, only load when needed
export const LazyAnalyticsDashboard = lazy(() => 
  scheduleTask(() => import('@/components/admin/AnalyticsDashboard'), { priority: 'background' })
);

export const LazyBlogPostEditor = lazy(() => 
  scheduleTask(() => import('@/components/admin/BlogPostEditor'), { priority: 'background' })
);

// Enhanced suspense wrapper with error boundary
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = <div className="h-32 bg-muted animate-pulse rounded-lg" />
) => {
  return (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};