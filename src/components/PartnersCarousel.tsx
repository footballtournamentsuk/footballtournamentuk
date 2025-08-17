import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Partner logos for the carousel
const partnerLogos = [
  { id: 1, name: 'ClubNest', logo: '/lovable-uploads/7d145396-e936-49e5-87e4-6c29729c64fc.png', alt: 'ClubNest Partner' },
  { id: 2, name: 'GoalForge', logo: '/lovable-uploads/992c1347-f37c-49d5-864c-ba97953328de.png', alt: 'GoalForge Partner' },
  { id: 3, name: 'KickLabs', logo: '/lovable-uploads/9a3deff3-483c-4ce2-aed1-7f8c5ded605d.png', alt: 'KickLabs Partner' },
  { id: 4, name: 'PitchWave', logo: '/lovable-uploads/d42568b2-fa20-4b81-86c4-baaf774b0912.png', alt: 'PitchWave Partner' },
  { id: 5, name: 'Play', logo: '/lovable-uploads/d9754e35-ee1d-4d36-a0d0-876e4ea0f618.png', alt: 'Play Partner' },
  { id: 6, name: 'YouthPro', logo: '/lovable-uploads/1c2164c6-5657-40fd-b65d-7a581c0ffddb.png', alt: 'YouthPro Partner' },
];

interface PartnersCarouselProps {
  showTitle?: boolean;
  showButton?: boolean;
  compact?: boolean;
}

const PartnersCarousel = ({ 
  showTitle = true, 
  showButton = true, 
  compact = false 
}: PartnersCarouselProps) => {
  // Create duplicated partners for seamless loop
  const duplicatedPartners = [...partnerLogos, ...partnerLogos];

  const handleBecomePartner = () => {
    window.location.href = 'mailto:info@footballtournamentsuk.co.uk?subject=Partnership Inquiry';
  };

  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      {showTitle && (
        <div className="text-center">
          <h2 className={compact ? "text-lg font-semibold" : "text-2xl md:text-3xl font-bold"}>
            {compact ? "Official Partners" : "Our Partners"}
          </h2>
          {!compact && (
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Trusted by leading football organizations
            </p>
          )}
        </div>
      )}

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-8 items-center hover:pause"
          style={{
            width: `${duplicatedPartners.length * 180}px`,
            animation: `scroll-continuous ${partnerLogos.length * 8}s linear infinite`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = 'paused';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = 'running';
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div 
              key={`${partner.id}-${index}`} 
              className={`flex-shrink-0 ${compact ? "w-36" : "w-44"} flex items-center justify-center`}
            >
              <div className="
                bg-transparent hover:grayscale hover:opacity-70 
                transition-all duration-300 
                rounded-lg p-4 w-full 
                flex items-center justify-center 
                transform hover:scale-105 cursor-pointer
              ">
                <img 
                  src={partner.logo} 
                  alt={partner.alt}
                  className={`max-w-full max-h-full object-contain ${compact ? "h-12" : "h-16"}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showButton && (
        <div className="text-center">
          <Button 
            onClick={handleBecomePartner}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-6 py-3 gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <ExternalLink className="h-4 w-4" />
            Become a Partner
          </Button>
        </div>
      )}
    </div>
  );
};

export default PartnersCarousel;