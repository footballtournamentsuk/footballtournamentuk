import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import bookMyCoachLogo from '@/assets/partners/bookmycoach-logo.png';

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

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {showTitle && (
        <div className="text-center">
          <h2 className={compact ? "text-lg font-semibold" : "text-2xl md:text-3xl font-bold"}>
            {compact ? "Official Partner" : "Our Partner"}
          </h2>
          {!compact && (
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Trusted partner in football coaching
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-4">
        <a 
          href="https://bookmycoach.co.uk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group transition-all duration-300 hover:scale-105"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src={bookMyCoachLogo} 
              alt="BookMyCoach - Football Coaching Platform"
              className={`object-contain mx-auto ${compact ? "h-16 md:h-20" : "h-24 md:h-32"}`}
            />
          </div>
        </a>
        
        <Button 
          asChild
          variant="outline"
          className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <a 
            href="https://bookmycoach.co.uk" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Learn More
          </a>
        </Button>
      </div>

      {showButton && (
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/partners'}
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