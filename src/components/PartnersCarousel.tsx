import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Placeholder partner logos (we'll replace with real ones later)
const placeholderPartners = [
  { id: 1, name: 'FootballHub', logo: '/api/placeholder/120/60' },
  { id: 2, name: 'YouthSports', logo: '/api/placeholder/140/60' },
  { id: 3, name: 'LocalLeagues', logo: '/api/placeholder/110/60' },
  { id: 4, name: 'SportsTech', logo: '/api/placeholder/130/60' },
  { id: 5, name: 'GameDay', logo: '/api/placeholder/120/60' },
  { id: 6, name: 'MatchMaker', logo: '/api/placeholder/125/60' },
  { id: 7, name: 'TeamConnect', logo: '/api/placeholder/135/60' },
  { id: 8, name: 'PlayBall', logo: '/api/placeholder/115/60' },
];

interface PartnersCarouselProps {
  showTitle?: boolean;
  showButton?: boolean;
  compact?: boolean;
}

export const PartnersCarousel = ({ 
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
              Trusted by leading organizations in football and youth sports
            </p>
          )}
        </div>
      )}

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-8 items-center hover:pause"
          style={{
            width: `${duplicatedPartners.length * 160}px`,
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
              className={`flex-shrink-0 ${compact ? "w-32" : "w-40"} flex items-center justify-center`}
            >
              <div className="bg-white/5 hover:bg-white/10 transition-colors duration-200 rounded-lg p-4 w-full h-16 flex items-center justify-center">
                {/* Placeholder logo - replace with actual logos later */}
                <div className="bg-muted/20 rounded px-3 py-2 text-xs font-medium text-muted-foreground">
                  {partner.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showButton && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleBecomePartner}
            className="gap-2"
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