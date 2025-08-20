import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEngagementTracker } from '@/hooks/useEngagementTracker';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useToast } from '@/hooks/use-toast';
import { Home, Search, HelpCircle, Mail, User, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BottomNavigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { trackMeaningfulAction } = useEngagementTracker();
  const { manualRefresh } = usePullToRefresh();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detect if running as installed PWA
  const isPWA = useCallback(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }, []);

  // Only show on mobile devices
  if (!isMobile) return null;

  // Check if PWA once to avoid multiple calls
  const isInPWA = isPWA();

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Track analytics
    trackMeaningfulAction('manual_refresh');

    try {
      await manualRefresh();
      toast({
        title: "Updated",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Refresh failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Keep button disabled for 3 seconds to prevent spam
      setTimeout(() => setIsRefreshing(false), 3000);
    }
  }, [isRefreshing, manualRefresh, trackMeaningfulAction, location.pathname, toast]);

  const handleAddEvent = () => {
    if (user) {
      navigate('/profile?tab=tournaments');
    } else {
      navigate('/auth');
    }
  };

  const handleContact = () => {
    window.location.href = 'mailto:info@footballtournamentsuk.co.uk';
  };

  const handleSearchClick = () => {
    trackMeaningfulAction('nav_search_clicked');
    console.log('Navigation search clicked', { 
      auth: user ? 'user' : 'guest',
      timestamp: new Date().toISOString()
    });
    navigate('/tournaments');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Tab configurations for different user states
  const nonRegisteredTabs = [
    {
      icon: Home,
      label: 'Home',
      action: () => navigate('/'),
      isActive: isActive('/') && location.pathname === '/'
    },
    {
      icon: Search,
      label: 'Search',
      action: handleSearchClick,
      isActive: location.pathname === '/tournaments'
    },
    ...(isInPWA ? [{
      icon: RefreshCw,
      label: 'Refresh',
      action: handleRefresh,
      isActive: false,
      isRefreshing
    }] : []),
    {
      icon: HelpCircle,
      label: 'FAQ',
      action: () => navigate('/faq'),
      isActive: isActive('/faq')
    },
    {
      icon: Mail,
      label: 'Contact',
      action: handleContact,
      isActive: false
    }
  ];

  const registeredTabs = [
    {
      icon: Home,
      label: 'Home',
      action: () => navigate('/'),
      isActive: isActive('/') && location.pathname === '/'
    },
    {
      icon: User,
      label: 'Profile',
      action: () => navigate('/profile'),
      isActive: isActive('/profile')
    },
    {
      icon: Plus,
      label: 'Add Event',
      action: handleAddEvent,
      isActive: false
    },
    ...(isInPWA ? [{
      icon: RefreshCw,
      label: 'Refresh',
      action: handleRefresh,
      isActive: false,
      isRefreshing
    }] : []),
    {
      icon: Search,
      label: 'Search',
      action: handleSearchClick,
      isActive: location.pathname === '/tournaments'
    }
  ];

  const tabs = user ? registeredTabs : nonRegisteredTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isRefreshButton = tab.label === 'Refresh';
          const isRefreshDisabled = isRefreshButton && (tab as any).isRefreshing;
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={tab.action}
              disabled={isRefreshDisabled}
              aria-label={tab.label === 'Search' ? 'Search tournaments' : tab.label}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                tab.isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              } ${isRefreshDisabled ? 'opacity-50' : ''}`}
            >
              <Icon 
                className={`h-5 w-5 ${isRefreshDisabled ? 'animate-spin' : ''}`} 
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;