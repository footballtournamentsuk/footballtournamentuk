import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => (
  <div 
    className={cn(
      "animate-pulse rounded-md bg-muted/60",
      className
    )}
    aria-label="Loading content"
  >
    {children}
  </div>
);

// Tournament Card Skeleton
export const TournamentCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg border p-4 space-y-3">
    <Skeleton className="h-48 w-full rounded-md" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

// Filter Skeleton
export const FiltersSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg border p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-18" />
    </div>
  </div>
);

// Hero Section Skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="relative h-[500px] bg-muted/20">
    <Skeleton className="absolute inset-0" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-2xl px-4">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
        <Skeleton className="h-12 w-40 mx-auto" />
      </div>
    </div>
  </div>
);