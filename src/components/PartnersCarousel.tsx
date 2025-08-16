import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Placeholder partner data with color schemes
const placeholderPartners = [
  { id: 1, name: 'SportsTech', bgColor: 'bg-blue-500', textColor: 'text-white' },
  { id: 2, name: 'GameDay', bgColor: 'bg-green-500', textColor: 'text-white' },
  { id: 3, name: 'FootballHub', bgColor: 'bg-red-500', textColor: 'text-white' },
  { id: 4, name: 'YouthSports', bgColor: 'bg-purple-500', textColor: 'text-white' },
  { id: 5, name: 'LocalLeagues', bgColor: 'bg-teal-500', textColor: 'text-white' },
  { id: 6, name: 'MatchMaker', bgColor: 'bg-pink-500', textColor: 'text-white' },
  { id: 7, name: 'TeamConnect', bgColor: 'bg-indigo-500', textColor: 'text-white' },
  { id: 8, name: 'PlayBall', bgColor: 'bg-orange-500', textColor: 'text-white' },
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
  const duplicatedPartners = [...placeholderPartners, ...placeholderPartners];

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
            animation: `scroll-continuous ${placeholderPartners.length * 8}s linear infinite`,
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
              <div className={`
                ${partner.bgColor} ${partner.textColor}
                hover:grayscale hover:opacity-70 
                transition-all duration-300 
                rounded-lg px-6 py-4 w-full 
                ${compact ? "h-16" : "h-20"} 
                flex items-center justify-center 
                shadow-md hover:shadow-lg
                transform hover:scale-105
              `}>
                <div className="text-center">
                  <div className={`font-bold ${compact ? "text-sm" : "text-base"}`}>
                    {partner.name}
                  </div>
                  <div className={`text-xs opacity-90 ${compact ? "hidden" : "block"}`}>
                    PARTNER
                  </div>
                </div>
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