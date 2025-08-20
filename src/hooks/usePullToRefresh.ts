import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface PullToRefreshOptions {
  threshold?: number;
  maxPullDistance?: number;
  resistance?: number;
  onRefresh?: () => Promise<void> | void;
  disabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
}

export const usePullToRefresh = (options: PullToRefreshOptions = {}) => {
  const {
    threshold = 70,
    maxPullDistance = 120,
    resistance = 2.5,
    onRefresh,
    disabled = false
  } = options;

  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false
  });

  const location = useLocation();
  const { toast } = useToast();
  const containerRef = useRef<HTMLElement | null>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const lastRefreshTime = useRef(0);
  const isOnline = useRef(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => { isOnline.current = true; };
    const handleOffline = () => { isOnline.current = false; };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset state when route changes
  useEffect(() => {
    setState({
      isPulling: false,
      pullDistance: 0,
      isRefreshing: false,
      canRefresh: false
    });
  }, [location.pathname]);

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop === 0;
  }, []);

  const shouldDisable = useCallback(() => {
    if (disabled) return true;
    
    // Disable if modal is open
    const modalOpen = document.querySelector('[role="dialog"]') || 
                     document.querySelector('.modal-overlay') ||
                     document.body.classList.contains('modal-open');
    
    // Disable if input is focused
    const inputFocused = document.activeElement && 
                        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    
    // Rate limiting - prevent refresh within 10 seconds
    const timeSinceLastRefresh = Date.now() - lastRefreshTime.current;
    const rateLimited = timeSinceLastRefresh < 10000;
    
    return !!(modalOpen || inputFocused || rateLimited);
  }, [disabled]);

  const checkForServiceWorkerUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Check for updates by calling update on registration
          await registration.update();
          
          // Check if there's a waiting service worker after update
          if (registration.waiting) {
            // New service worker is waiting, trigger skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Listen for the new service worker to take control
            const handleControllerChange = () => {
              window.location.reload();
            };
            
            navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true });
          }
        }
      } catch (error) {
        console.warn('Service Worker update check failed:', error);
      }
    }
  }, []);

  const performRefresh = useCallback(async () => {
    if (state.isRefreshing || shouldDisable()) return;

    setState(prev => ({ ...prev, isRefreshing: true }));
    lastRefreshTime.current = Date.now();

    try {
      // Check if offline
      if (!isOnline.current) {
        toast({
          title: "You're offline",
          description: "Showing cached content",
          variant: "default"
        });
        return;
      }

      // Perform custom refresh if provided
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default refresh - reload page data
        window.location.reload();
      }

      // Check for service worker updates
      await checkForServiceWorkerUpdate();

      // Show success message
      toast({
        title: "Updated just now",
        description: "Content has been refreshed",
        variant: "default"
      });

    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: "Refresh failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false
      }));
    }
  }, [state.isRefreshing, shouldDisable, onRefresh, checkForServiceWorkerUpdate, toast]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (shouldDisable() || !isAtTop()) return;

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
  }, [shouldDisable, isAtTop]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (shouldDisable() || !isAtTop()) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Apply resistance to pull distance
      const pullDistance = Math.min(deltaY / resistance, maxPullDistance);
      const canRefresh = pullDistance >= threshold;

      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        canRefresh
      }));

      // Add overscroll behavior to prevent page bounce on iOS
      if (containerRef.current) {
        containerRef.current.style.overscrollBehaviorY = 'contain';
      }
    }
  }, [shouldDisable, isAtTop, threshold, maxPullDistance, resistance]);

  const handleTouchEnd = useCallback(() => {
    if (shouldDisable()) return;

    // Reset overscroll behavior
    if (containerRef.current) {
      containerRef.current.style.overscrollBehaviorY = 'auto';
    }

    if (state.canRefresh && state.isPulling) {
      performRefresh();
    } else {
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false
      }));
    }
  }, [shouldDisable, state.canRefresh, state.isPulling, performRefresh]);

  // Set up container ref and event listeners
  const bindToContainer = useCallback((element: HTMLElement | null) => {
    if (containerRef.current) {
      containerRef.current.removeEventListener('touchstart', handleTouchStart);
      containerRef.current.removeEventListener('touchmove', handleTouchMove);
      containerRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    containerRef.current = element;

    if (element) {
      // Apply touch-action for better mobile handling
      element.style.touchAction = 'pan-y';
      (element.style as any).webkitOverflowScrolling = 'touch';

      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...state,
    bindToContainer,
    manualRefresh: performRefresh
  };
};