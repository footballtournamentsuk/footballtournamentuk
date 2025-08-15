import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check, X, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
  size = 'sm',
  variant = 'outline'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { toast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // Check if Web Share API is supported (typically mobile)
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  // Generate QR code when needed
  useEffect(() => {
    if (showQR && !qrDataUrl) {
      const utmUrl = `${url}?utm_source=qr&utm_medium=share&utm_campaign=tournament`;
      QRCode.toDataURL(utmUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).then(setQrDataUrl);
    }
  }, [showQR, url, qrDataUrl]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const createUtmUrl = (platform: string) => {
    return `${url}?utm_source=${platform}&utm_medium=share&utm_campaign=tournament`;
  };

  const handleNativeShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url: createUtmUrl('native')
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall back to modal
      }
    }
    setIsOpen(true);
  };

  const handleCopyLink = async () => {
    const utmUrl = createUtmUrl('copy');
    try {
      await navigator.clipboard.writeText(utmUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Tournament link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${createUtmUrl('whatsapp')}`)}`,
      icon: '💬',
      bgColor: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(createUtmUrl('telegram'))}&text=${encodeURIComponent(title)}`,
      icon: '✈️',
      bgColor: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(createUtmUrl('facebook'))}`,
      icon: '📘',
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(createUtmUrl('twitter'))}&text=${encodeURIComponent(title)}`,
      icon: '🐦',
      bgColor: 'bg-black hover:bg-gray-800',
      textColor: 'text-white'
    },
    {
      name: 'Messenger',
      url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(createUtmUrl('messenger'))}&app_id=YOUR_APP_ID`,
      icon: '💙',
      bgColor: 'bg-blue-400 hover:bg-blue-500',
      textColor: 'text-white'
    },
    {
      name: 'Email',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this tournament: ${createUtmUrl('email')}`)}`,
      icon: '📧',
      bgColor: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    }
  ];

  const shortUrl = url.replace('https://', '').replace('http://', '');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleNativeShare}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 transition-colors duration-200 gap-2"
          aria-label={`Share ${title}`}
        >
          <Share2 className="h-4 w-4" />
          Share Tournament
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-md w-full mx-0 mb-0 rounded-t-xl rounded-b-none fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-hidden translate-y-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom animate-in"
        onPointerDownOutside={() => setIsOpen(false)}
        ref={modalRef}
      >
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Share Tournament</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 rounded-full"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Tournament Info */}
          <div className="py-4 border-b">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{title}</h3>
            <p className="text-xs text-muted-foreground">{shortUrl}</p>
          </div>

          {/* QR Code Section */}
          {showQR && qrDataUrl && (
            <div className="py-4 border-b text-center">
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                className="mx-auto mb-2 rounded-lg"
              />
              <p className="text-xs text-muted-foreground">Scan with camera to share</p>
            </div>
          )}
          
          {/* Share Options Grid */}
          <div className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  variant="outline"
                  className={`${option.bgColor} ${option.textColor} border-0 justify-start gap-3 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={() => {
                    window.open(option.url, '_blank', 'noopener,noreferrer');
                    setIsOpen(false);
                  }}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm">{option.name}</span>
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full justify-center gap-3 h-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="font-medium">Copy Link</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center gap-3 h-12 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="h-4 w-4" />
                <span className="font-medium">{showQR ? 'Hide' : 'Show'} QR Code</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};