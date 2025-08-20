import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { X, Download, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEngagementTracker } from '@/hooks/useEngagementTracker';
import { trackPWAPromptShown, trackPWAInstalled, trackPWAPromptDismissed } from '@/hooks/useAnalyticsEvents';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();
  const { isEngaged, isCookieConsentActive, trackMeaningfulAction } = useEngagementTracker();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show immediately - wait for engagement
      console.log('PWA install prompt event captured, waiting for engagement...');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast({
        title: "App Installed!",
        description: "Football Tournaments UK is now available on your home screen.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  // Check engagement and show prompt when conditions are met
  useEffect(() => {
    // Only log debug info occasionally to avoid spam
    const shouldLog = Math.random() < 0.1; // Log only ~10% of the time
    
    const engagementStatus = isEngaged();
    const cookieStatus = isCookieConsentActive();
    const promptDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    const promptShown = sessionStorage.getItem('pwa-prompt-shown');
    
    if (shouldLog) {
      console.log('PWA Prompt Check:', {
        deferredPrompt: !!deferredPrompt,
        isEngaged: engagementStatus,
        isCookieConsentActive: cookieStatus,
        promptDismissed: !!promptDismissed,
        promptShown: !!promptShown,
        isInstalled,
        isIOS
      });
    }

    if (
      deferredPrompt &&
      engagementStatus &&
      !cookieStatus &&
      !promptDismissed &&
      !promptShown &&
      !isInstalled
    ) {
      if (shouldLog) console.log('PWA prompt will show for Android/Chrome in 2 seconds');
      // Additional delay to ensure cookie consent has settled
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        sessionStorage.setItem('pwa-prompt-shown', 'true');
        trackMeaningfulAction('pwa-prompt-shown');
        trackPWAPromptShown('automatic');
      }, 2000);

      return () => clearTimeout(timer);
    }

    // For iOS, show after engagement without needing deferredPrompt
    if (
      isIOS &&
      engagementStatus &&
      !cookieStatus &&
      !promptDismissed &&
      !promptShown &&
      !isInstalled
    ) {
      if (shouldLog) console.log('PWA prompt will show for iOS in 2 seconds');
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        sessionStorage.setItem('pwa-prompt-shown', 'true');
        trackMeaningfulAction('pwa-prompt-shown');
        trackPWAPromptShown('automatic');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, isEngaged, isCookieConsentActive, isIOS, isInstalled, trackMeaningfulAction]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        trackMeaningfulAction('pwa-install-accepted');
        trackPWAInstalled();
      } else {
        console.log('User dismissed the install prompt');
        trackMeaningfulAction('pwa-install-declined');
        trackPWAPromptDismissed('user_dismissed');
      }
    } catch (error) {
      console.error('Error showing PWA install prompt:', error);
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    trackMeaningfulAction('pwa-prompt-dismissed');
    trackPWAPromptDismissed('user_dismissed');
  };

  // Manual install trigger for external use
  const triggerManualInstall = useCallback(async () => {
    if (deferredPrompt) {
      await handleInstallClick();
    } else if (isIOS) {
      setShowInstallPrompt(true);
      trackMeaningfulAction('pwa-manual-install-trigger');
    } else {
      toast({
        title: "Install Not Available",
        description: "Your browser doesn't support app installation at this time.",
        variant: "destructive",
      });
    }
  }, [deferredPrompt, isIOS, toast, trackMeaningfulAction]);

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Android/Chrome Install Modal */}
      <Dialog open={showInstallPrompt && !!deferredPrompt} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className="sm:max-w-md glass border-0 text-white shadow-xl shadow-black/10">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <DialogTitle className="text-white">Add to Home Screen</DialogTitle>
            </div>
            <DialogDescription className="text-white/80">
              Get quick access to football tournaments with our app. Install it for a faster, more convenient experience.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleInstallClick}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="w-full border-border bg-background/95 text-foreground hover:bg-muted font-medium"
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* iOS Safari Instructions Modal */}
      <Dialog open={isIOS && showInstallPrompt && !deferredPrompt} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className="sm:max-w-md glass border-0 text-white shadow-xl shadow-black/10">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <DialogTitle className="text-white">Add to Home Screen</DialogTitle>
            </div>
            <DialogDescription className="text-white/80">
              Install this app on your iOS device for the best experience.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2 text-sm text-white/70">
              <p className="font-medium text-white">To install this app:</p>
              <div className="space-y-1 pl-4">
                <p>1. Tap the Share button (square with arrow up) in Safari</p>
                <p>2. Scroll down and tap "Add to Home Screen"</p>
                <p>3. Tap "Add" to confirm installation</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="w-full border-border bg-background/95 text-foreground hover:bg-muted font-medium"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Export manual trigger for use in Navigation
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();
  const { trackMeaningfulAction } = useEngagementTracker();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (isInstalled) {
      toast({
        title: "App Already Installed",
        description: "The app is already installed on your device.",
      });
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          trackMeaningfulAction('pwa-manual-install-accepted');
          toast({
            title: "Installing App...",
            description: "The app is being installed on your device.",
          });
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Error showing PWA install prompt:', error);
      }
    } else if (isIOS) {
      toast({
        title: "Install Instructions",
        description: "Tap the Share button in Safari, then 'Add to Home Screen'.",
      });
      trackMeaningfulAction('pwa-manual-install-ios-instructions');
    } else {
      toast({
        title: "Install Not Available",
        description: "Your browser doesn't support app installation at this time.",
        variant: "destructive",
      });
    }
  }, [deferredPrompt, isIOS, isInstalled, toast, trackMeaningfulAction]);

  return {
    canInstall: !isInstalled && (deferredPrompt || isIOS),
    isInstalled,
    triggerInstall,
  };
};