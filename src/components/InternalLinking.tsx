import React from 'react';
import { Link } from 'react-router-dom';
import { CityConfig, UK_CITIES } from '@/data/cities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, Trophy, Target } from 'lucide-react';

interface InternalLinkingProps {
  currentCity: CityConfig;
  tournamentCount: number;
}

export const InternalLinking: React.FC<InternalLinkingProps> = ({ currentCity, tournamentCount }) => {
  // Get nearby cities based on region or geographical proximity
  const getNearbyCities = () => {
    // First, get cities in the same region
    const sameRegion = UK_CITIES.filter(city => 
      city.region === currentCity.region && city.slug !== currentCity.slug
    );
    
    // If we have cities in the same region, return them
    if (sameRegion.length > 0) {
      return sameRegion.slice(0, 3);
    }
    
    // Otherwise, calculate distance and return closest cities
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };
    
    return UK_CITIES
      .filter(city => city.slug !== currentCity.slug)
      .map(city => ({
        ...city,
        distance: calculateDistance(
          currentCity.coordinates[1], currentCity.coordinates[0],
          city.coordinates[1], city.coordinates[0]
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  };

  const nearbyCities = getNearbyCities();

  return (
    <div className="space-y-8">
      {/* Related Cities Section */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Related Tournament Locations
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {nearbyCities.map((city) => (
              <Card key={city.slug} className="p-6 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {city.displayName}
                    </h4>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {city.seoDescription.substring(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {city.region}
                  </Badge>
                  <Link 
                    to={`/city/${city.slug}`}
                    className="text-primary text-sm hover:underline font-medium"
                  >
                    View Tournaments →
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Regional Overview Link */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  Explore All {currentCity.region} Tournaments
                </h4>
                <p className="text-muted-foreground">
                  Discover all youth football tournaments across {currentCity.region} and surrounding areas.
                </p>
              </div>
              <Link to="/" className="flex items-center gap-2 text-primary hover:underline font-medium">
                Browse All Cities
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Format Links */}
      <section className="py-8 bg-surface rounded-lg">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            Popular Tournament Formats in {currentCity.displayName}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['3v3', '5v5', '7v7', '9v9', '11v11'].map((format) => (
              <div key={format} className="group">
                <Card className="p-4 text-center transition-all">
                  <div className="text-lg font-bold text-primary">
                    {format}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Football
                  </div>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Looking for a specific tournament format? Use our advanced filters to find exactly what you need.
            </p>
            <span className="inline-flex items-center gap-2 text-muted-foreground font-medium">
              Tournament filtering coming soon
            </span>
          </div>
        </div>
      </section>

      {/* Age Group Links */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold mb-6">
            Tournament Age Groups Available
          </h3>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U18'].map((age) => (
              <div key={age} className="group">
                <div className="bg-surface rounded-lg p-3 text-center transition-all">
                  <div className="font-semibold text-primary">
                    {age}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-References */}
      <section className="py-8 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-lg">
        <div className="container mx-auto px-6">
          <h3 className="text-xl font-semibold mb-4">
            More Football Opportunities in {currentCity.displayName}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-primary">Tournament Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-primary hover:underline">
                    Frequently Asked Questions about Youth Tournaments
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-muted-foreground hover:text-primary hover:underline">
                    Tournament Support and Guidance
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary hover:underline">
                    About Youth Football Development
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-primary">Get Involved</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-primary hover:underline">
                    Register Your Team for Tournaments
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-muted-foreground hover:text-primary hover:underline">
                    Manage Your Tournament Profile
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="text-muted-foreground hover:text-primary hover:underline">
                    Partner Organizations in {currentCity.region}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
