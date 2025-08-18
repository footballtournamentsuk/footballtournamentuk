import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Users, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CityConfig } from '@/data/cities';

interface CityOrganizerCTAProps {
  city: CityConfig;
}

const CityOrganizerCTA: React.FC<CityOrganizerCTAProps> = ({ city }) => {
  const { user } = useAuth();

  return (
    <section className="py-12 bg-surface/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 via-surface to-secondary/5 rounded-2xl p-8 border border-primary/10 hover:border-primary/20 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Local Organizer Opportunity</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
                Organize a Tournament in {city.displayName}?
              </h3>
              
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join other local organizers and connect with teams in your area. 
                List your {city.displayName} tournament for free and reach hundreds of local players.
              </p>
            </div>

            {/* Local Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Local Reach</div>
                  <div className="text-sm text-muted-foreground">{city.displayName} teams</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Free Listing</div>
                  <div className="text-sm text-muted-foreground">No hidden costs</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Quick Setup</div>
                  <div className="text-sm text-muted-foreground">Live in 5 minutes</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl px-6 md:px-8 py-3 text-base md:text-lg font-semibold w-full max-w-md mx-auto"
              >
                <Link 
                  to={user ? "/profile?tab=tournaments" : "/auth"} 
                  className="flex items-center justify-center gap-2 text-center leading-tight"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="break-words">
                    {user 
                      ? (city.displayName.length > 12 
                          ? `Add Tournament in ${city.displayName}` 
                          : `Add Your ${city.displayName} Tournament`)
                      : "Register & Add Tournament"
                    }
                  </span>
                </Link>
              </Button>
              
              {!user && (
                <p className="text-sm text-muted-foreground mt-3">
                  Already have an account? <Link to="/auth" className="text-primary hover:underline font-medium">Sign in here</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityOrganizerCTA;