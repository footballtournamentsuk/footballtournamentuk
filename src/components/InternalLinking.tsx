import React from 'react';
import { Link } from 'react-router-dom';
import { CityConfig, UK_CITIES } from '@/data/cities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, Trophy, Target, Users, Calendar } from 'lucide-react';
import tournamentFormatsImage from '@/assets/tournament-formats-card.webp';
import ageGroupsImage from '@/assets/age-groups-card.webp';

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

      {/* Tournament Format Card */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            Popular Tournament Formats in {currentCity.displayName}
          </h3>
          
          {/* Visual Card */}
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="relative h-64 md:h-80">
              <img
                src={tournamentFormatsImage}
                alt="Multiple football tournament formats including 3v3, 5v5, 7v7, 9v9, and 11v11 matches being played on various sized pitches"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Multiple Formats Available
                </h4>
                <p className="text-lg text-white/90 mb-4">
                  3v3 • 5v5 • 7v7 • 9v9 • 11v11 Football Tournaments
                </p>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">All skill levels welcome</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* SEO Hidden Content */}
          <div className="sr-only" aria-hidden="true">
            <h4>Available Tournament Formats in {currentCity.displayName}</h4>
            <ul>
              <li>3v3 Football Tournaments - Small-sided games perfect for young players</li>
              <li>5v5 Football Tournaments - Popular format for youth development</li>
              <li>7v7 Football Tournaments - Standard format for junior leagues</li>
              <li>9v9 Football Tournaments - Semi-professional youth format</li>
              <li>11v11 Football Tournaments - Full-size pitch professional format</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Age Groups Card */}
      <section className="py-8 bg-surface rounded-lg">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            Tournament Age Groups Available
          </h3>
          
          {/* Visual Card */}
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="relative h-64 md:h-80">
              <img
                src={ageGroupsImage}
                alt="Youth football players of all ages from U6 to U21 training together on a football pitch, showing progression from children to young adults"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  All Age Groups Available
                </h4>
                <p className="text-lg text-white/90 mb-4">
                  U6 to U21 Youth Football Development
                </p>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Comprehensive youth development programs</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* SEO Hidden Content */}
          <div className="sr-only" aria-hidden="true">
            <h4>Available Age Groups in {currentCity.displayName} Football Tournaments</h4>
            <ul>
              <li>U6 Football Tournaments - Under 6 years old football development</li>
              <li>U7 Football Tournaments - Under 7 years old youth football</li>
              <li>U8 Football Tournaments - Under 8 years old junior tournaments</li>
              <li>U9 Football Tournaments - Under 9 years old competitive football</li>
              <li>U10 Football Tournaments - Under 10 years old youth development</li>
              <li>U11 Football Tournaments - Under 11 years old junior competitions</li>
              <li>U12 Football Tournaments - Under 12 years old youth tournaments</li>
              <li>U13 Football Tournaments - Under 13 years old teenage football</li>
              <li>U14 Football Tournaments - Under 14 years old junior leagues</li>
              <li>U15 Football Tournaments - Under 15 years old youth competitions</li>
              <li>U16 Football Tournaments - Under 16 years old teenage tournaments</li>
              <li>U18 Football Tournaments - Under 18 years old youth football</li>
              <li>U21 Football Tournaments - Under 21 years old development leagues</li>
            </ul>
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
