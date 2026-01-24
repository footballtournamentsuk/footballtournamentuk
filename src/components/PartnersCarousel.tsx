import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';
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

      <div className="flex justify-center px-4">
        <div className="w-full max-w-3xl bg-gradient-to-br from-card via-card to-accent/5 border border-border/50 rounded-3xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 group">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <a 
                href="https://bookmycoach.co.uk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-gradient-to-br from-background/80 to-background border border-border/30 rounded-2xl p-5 md:p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <img 
                    src={bookMyCoachLogo} 
                    alt="BookMyCoach - Football Coaching Platform"
                    className="h-20 md:h-28 w-20 md:w-28 object-contain"
                  />
                </div>
              </a>
            </div>
            
            {/* Content Section */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                BookMyCoach
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                BookMyCoach is a UK platform designed for sports and fitness coaches to manage clients, schedules and payments in one place. Simple, secure and built to support growing coaching businesses.
              </p>
              
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn"
              >
                <a 
                  href="https://bookmycoach.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showButton && (
        <div className="text-center pt-2">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/partners'}
            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
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