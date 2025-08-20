import React from 'react';
import { Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
  threshold?: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  isPulling,
  pullDistance,
  isRefreshing,
  canRefresh,
  threshold = 70
}) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  if (!isPulling && !isRefreshing) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200",
        "bg-background/95 backdrop-blur-sm border-b border-border/50",
        isPulling || isRefreshing ? "translate-y-0" : "-translate-y-full"
      )}
      style={{
        height: Math.max(pullDistance, isRefreshing ? threshold : 0),
        opacity: isPulling || isRefreshing ? 1 : 0
      }}
    >
      <div className="flex items-center gap-3 text-muted-foreground">
        {isRefreshing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground" aria-live="polite">
              Refreshing...
            </span>
          </>
        ) : canRefresh ? (
          <>
            <RefreshCw className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Release to refresh
            </span>
          </>
        ) : (
          <>
            <ChevronDown 
              className="w-5 h-5 transition-transform duration-200 text-muted-foreground"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <span className="text-sm text-muted-foreground">
              Pull to refresh
            </span>
          </>
        )}
      </div>

      {/* Progress indicator */}
      {isPulling && !isRefreshing && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};