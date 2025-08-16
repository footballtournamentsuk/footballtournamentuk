import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, X, QrCode, Mail } from 'lucide-react';
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
      const { url: trackingUrl } = createShareMessage('qr');
      QRCode.toDataURL(trackingUrl, {
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

  const createShareMessage = (platform: string) => {
    const baseMessage = `Check out ${title}! ⚽`;
    const utmParams = new URLSearchParams({
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: 'tournament_share',
    });
    const trackingUrl = `${url}?${utmParams.toString()}`;
    
    return {
      message: baseMessage,
      url: trackingUrl
    };
  };

  const handleNativeShare = async () => {
    if (canShare) {
      try {
        const { message, url: trackingUrl } = createShareMessage('native');
        await navigator.share({
          title,
          text: message,
          url: trackingUrl
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall back to modal
      }
    }
    setIsOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      const { url: trackingUrl } = createShareMessage('copy_link');
      await navigator.clipboard.writeText(trackingUrl);
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

  // Official brand icons as SVG components
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
    </svg>
  );

  const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#26A5E4">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );

  const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const shareOptions = [
    {
      name: 'WhatsApp',
      url: () => {
        const { message, url: trackingUrl } = createShareMessage('whatsapp');
        return `https://wa.me/?text=${encodeURIComponent(`${message} ${trackingUrl}`)}`;
      },
      icon: <WhatsAppIcon />,
      iconColor: '#25D366'
    },
    {
      name: 'Telegram',
      url: () => {
        const { message, url: trackingUrl } = createShareMessage('telegram');
        return `https://t.me/share/url?url=${encodeURIComponent(trackingUrl)}&text=${encodeURIComponent(message)}`;
      },
      icon: <TelegramIcon />,
      iconColor: '#26A5E4'
    },
    {
      name: 'X (Twitter)',
      url: () => {
        const { message, url: trackingUrl } = createShareMessage('twitter');
        return `https://x.com/intent/tweet?text=${encodeURIComponent(`${message} ${trackingUrl}`)}`;
      },
      icon: <XIcon />,
      iconColor: 'currentColor'
    },
    {
      name: 'Facebook',
      url: () => {
        const { url: trackingUrl } = createShareMessage('facebook');
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackingUrl)}`;
      },
      icon: <FacebookIcon />,
      iconColor: '#1877F2'
    },
    {
      name: 'Email',
      url: () => {
        const { message, url: trackingUrl } = createShareMessage('email');
        return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message} ${trackingUrl}`)}`;
      },
      icon: <Mail className="w-5 h-5" />,
      iconColor: '#6B7280'
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
                      className="w-full justify-start gap-4 h-12 rounded-xl border border-border hover:bg-muted active:scale-[0.98] 
                                 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary text-base font-medium"
                      onClick={() => {
                        window.open(option.url(), '_blank', 'noopener,noreferrer');
                        closeModal();
                      }}
                    >
                      <div className="flex-shrink-0">
                        {option.icon}
                      </div>
                      <span className="text-foreground">{option.name}</span>
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