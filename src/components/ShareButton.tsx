import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Check if Web Share API is supported (typically mobile)
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const handleNativeShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        // User cancelled or share failed, fall back to modal
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
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

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  const socialButtons = [
    {
      name: 'Facebook',
      url: shareUrls.facebook,
      icon: '📘',
      color: 'hover:bg-blue-50 hover:text-blue-600'
    },
    {
      name: 'Twitter/X',
      url: shareUrls.twitter,
      icon: '🐦',
      color: 'hover:bg-sky-50 hover:text-sky-600'
    },
    {
      name: 'WhatsApp',
      url: shareUrls.whatsapp,
      icon: '💬',
      color: 'hover:bg-green-50 hover:text-green-600'
    },
    {
      name: 'Telegram',
      url: shareUrls.telegram,
      icon: '✈️',
      color: 'hover:bg-blue-50 hover:text-blue-500'
    }
  ];

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
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Tournament</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {socialButtons.map((social) => (
              <Button
                key={social.name}
                variant="outline"
                className={`justify-start gap-3 ${social.color} transition-colors`}
                onClick={() => {
                  window.open(social.url, '_blank', 'noopener,noreferrer');
                  setIsOpen(false);
                }}
              >
                <span className="text-lg">{social.icon}</span>
                {social.name}
              </Button>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-muted rounded text-sm font-mono text-muted-foreground truncate">
                {url}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};