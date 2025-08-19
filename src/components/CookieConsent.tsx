import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    if (!cookieChoice) {
      // Show modal after a brief delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
    // Enable all cookies here if needed
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
    // Enable only essential cookies here if needed
  };

  const handleClose = () => {
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <Card className="max-w-md w-full glass shadow-xl shadow-black/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 
              id="cookie-consent-title" 
              className="text-lg font-semibold text-white"
            >
              Cookie Consent
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-white/20 text-white"
              aria-label="Close cookie consent dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p 
            id="cookie-consent-description" 
            className="text-sm text-white/80 mb-6 leading-relaxed"
          >
            We use cookies to improve your browsing experience, provide personalized services, and analyze site performance. For more details, see our{" "}
            <Link 
              to="/cookie-policy" 
              className="text-white underline hover:text-white/80 font-medium"
              onClick={() => setShowConsent(false)}
            >
              Cookie Policy
            </Link>
            .
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleAccept}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
              aria-label="Accept all cookies"
            >
              Accept
            </Button>
            <Button 
              onClick={handleDecline}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              aria-label="Decline non-essential cookies"
            >
              Decline
            </Button>
            <Button 
              asChild
              variant="ghost"
              className="flex-1 text-white hover:text-white/80 hover:bg-white/10"
              onClick={() => setShowConsent(false)}
            >
              <Link to="/cookie-policy">Learn More</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};