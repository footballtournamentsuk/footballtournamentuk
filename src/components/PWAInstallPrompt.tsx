import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEngagementTracker } from '@/hooks/useEngagementTracker';

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
    if (
      deferredPrompt &&
      isEngaged() &&
      !isCookieConsentActive() &&
      !sessionStorage.getItem('pwa-prompt-dismissed') &&
      !sessionStorage.getItem('pwa-prompt-shown') &&
      !isInstalled
    ) {
      // Additional delay to ensure cookie consent has settled
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        sessionStorage.setItem('pwa-prompt-shown', 'true');
        trackMeaningfulAction('pwa-prompt-shown');
      }, 2000);

      return () => clearTimeout(timer);
    }

    // For iOS, show after engagement without needing deferredPrompt
    if (
      isIOS &&
      isEngaged() &&
      !isCookieConsentActive() &&
      !sessionStorage.getItem('pwa-prompt-dismissed') &&
      !sessionStorage.getItem('pwa-prompt-shown') &&
      !isInstalled
    ) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        sessionStorage.setItem('pwa-prompt-shown', 'true');
        trackMeaningfulAction('pwa-prompt-shown');
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
      } else {
        console.log('User dismissed the install prompt');
        trackMeaningfulAction('pwa-install-declined');
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
      {/* Android/Chrome Install Prompt */}
      {showInstallPrompt && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
          <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Add to Home Screen</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-xs">
                Get quick access to football tournaments with our app
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Install App
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* iOS Safari Instructions */}
      {isIOS && showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
          <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Add to Home Screen</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs mb-3">
                To install this app on your iOS device:
              </CardDescription>
              <div className="text-xs space-y-1 mb-3">
                <p>1. Tap the Share button in Safari</p>
                <p>2. Scroll down and tap "Add to Home Screen"</p>
                <p>3. Tap "Add" to install</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="w-full"
              >
                Got it
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
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