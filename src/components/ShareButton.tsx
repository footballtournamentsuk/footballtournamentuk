import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Check if Web Share API is supported (typically mobile)
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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
          closeModal();
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

  const closeModal = () => {
    setIsOpen(false);
    // Return focus to trigger button
    setTimeout(() => triggerRef.current?.focus(), 100);
  };

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
      bgColor: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
      textColor: 'text-white'
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(createUtmUrl('telegram'))}&text=${encodeURIComponent(title)}`,
      icon: '✈️',
      bgColor: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
      textColor: 'text-white'
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(createUtmUrl('twitter'))}&text=${encodeURIComponent(title)}`,
      icon: '🐦',
      bgColor: 'bg-gray-900 hover:bg-black active:bg-gray-800',
      textColor: 'text-white'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(createUtmUrl('facebook'))}`,
      icon: '📘',
      bgColor: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      textColor: 'text-white'
    },
    {
      name: 'Email',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this tournament: ${createUtmUrl('email')}`)}`,
      icon: '📧',
      bgColor: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
      textColor: 'text-white'
    }
  ];

  const shortUrl = url.replace('https://', '').replace('http://', '');

  return (
    <>
      <Button
        ref={triggerRef}
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 transition-colors duration-200 gap-2"
        aria-label={`Share ${title}`}
      >
        <Share2 className="h-4 w-4" />
        Share Tournament
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          aria-hidden="true"
        >
          {/* Modal Content */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-200 ease-out
                       sm:rounded-lg sm:max-h-[80vh] sm:my-auto
                       max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:max-h-[80vh] max-sm:animate-in max-sm:slide-in-from-bottom"
            style={{
              width: 'calc(100vw - 32px)',
              maxWidth: '480px',
              paddingLeft: 'max(16px, env(safe-area-inset-left))',
              paddingRight: 'max(16px, env(safe-area-inset-right))',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
              marginLeft: '16px',
              marginRight: '16px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 id="share-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Tournament
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close share dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content with scroll */}
            <div className="max-h-[calc(80vh-80px)] overflow-y-auto">
              {/* Tournament Info */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{shortUrl}</p>
              </div>

              {/* QR Code Section */}
              {showQR && qrDataUrl && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
                  <img 
                    src={qrDataUrl} 
                    alt="QR Code for tournament link" 
                    className="mx-auto mb-2 rounded-lg"
                    width="200"
                    height="200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Scan with camera to share</p>
                </div>
              )}
              
              {/* Share Options */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {shareOptions.map((option) => (
                    <Button
                      key={option.name}
                      variant="outline"
                      className={`${option.bgColor} ${option.textColor} border-0 justify-start gap-4 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-base`}
                      onClick={() => {
                        window.open(option.url, '_blank', 'noopener,noreferrer');
                        closeModal();
                      }}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span>{option.name}</span>
                    </Button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-3 h-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800 transition-all duration-200 text-base font-medium"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-green-600">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-center gap-3 h-12 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-base font-medium"
                    onClick={() => setShowQR(!showQR)}
                  >
                    <QrCode className="h-5 w-5" />
                    <span>{showQR ? 'Hide' : 'Show'} QR Code</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};