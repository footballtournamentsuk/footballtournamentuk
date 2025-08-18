import React from 'react';
import { CityConfig } from '@/data/cities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Trophy, Users, Star, Clock, Target, Award, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CityContentProps {
  city: CityConfig;
  tournamentCount: number;
}

export const CityContent: React.FC<CityContentProps> = ({ city, tournamentCount }) => {
  return (
    <div className="space-y-12">
      {/* Local Football Scene Section */}
      <section className="py-12 bg-surface rounded-lg">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            Local Football Scene in {city.displayName}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Football Heritage & Culture</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {city.displayName} has a rich football heritage that shapes the local tournament scene. 
                  The region's passionate football community creates an environment where young players 
                  can thrive and develop their skills. Local clubs and organizations work together to 
                  provide high-quality tournament experiences that reflect the area's commitment to youth development.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Community & Facilities</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The football infrastructure in {city.displayName} and {city.region} provides excellent 
                  venues for youth tournaments. From community pitches to professional-standard facilities, 
                  tournament organizers have access to high-quality locations that ensure safe and 
                  enjoyable playing conditions for all participants.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center bg-gradient-to-br from-primary/5 to-primary/10">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{tournamentCount}+</div>
                <div className="text-sm text-muted-foreground">Active Tournaments</div>
              </Card>
              
              <Card className="p-4 text-center bg-gradient-to-br from-secondary/5 to-secondary/10">
                <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">All Ages</div>
                <div className="text-sm text-muted-foreground">U6 to U21</div>
              </Card>
              
              <Card className="p-4 text-center bg-gradient-to-br from-accent/5 to-accent/10">
                <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">Multiple</div>
                <div className="text-sm text-muted-foreground">Venues Available</div>
              </Card>
              
              <Card className="p-4 text-center bg-gradient-to-br from-success/5 to-success/10">
                <Star className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-success">Quality</div>
                <div className="text-sm text-muted-foreground">Guaranteed</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Guide Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Complete Tournament Guide for {city.displayName}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <p className="text-muted-foreground text-sm mb-4">
                New to youth football tournaments? Learn how to find, register, and prepare your team 
                for competitions in {city.displayName}. We'll guide you through the entire process.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Registration</Badge>
                  <span className="text-muted-foreground">Online booking available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Age Groups</Badge>
                  <span className="text-muted-foreground">U6 to U21 categories</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-lg font-semibold mb-3">Tournament Formats</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Understand different tournament formats available in {city.displayName}. From small-sided 
                games to full 11v11 competitions, choose the right format for your team's development.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">3v3 & 5v5</Badge>
                  <span className="text-muted-foreground">Skill development focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">7v7 & 9v9</Badge>
                  <span className="text-muted-foreground">Tactical awareness</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">11v11</Badge>
                  <span className="text-muted-foreground">Full match experience</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Award className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-semibold mb-3">Local Resources</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Discover local football clubs, training facilities, and support services in {city.displayName} 
                to enhance your tournament experience and ongoing player development.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Local Clubs</Badge>
                  <span className="text-muted-foreground">Partnership opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Training</Badge>
                  <span className="text-muted-foreground">Skill development programs</span>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="bg-surface rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Tournament Planning Checklist</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-primary">Before Tournament Day</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Complete team registration and payment</li>
                  <li>✓ Confirm player availability and squad size</li>
                  <li>✓ Review tournament rules and regulations</li>
                  <li>✓ Organize transport and arrival times</li>
                  <li>✓ Prepare necessary equipment and kit</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-primary">On Tournament Day</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Arrive early for registration check-in</li>
                  <li>✓ Warm up properly before matches</li>
                  <li>✓ Stay hydrated and fuel appropriately</li>
                  <li>✓ Support other teams and maintain sportsmanship</li>
                  <li>✓ Celebrate participation and effort</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Football Information */}
      <section className="py-12 bg-surface rounded-lg">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            Football in {city.region}
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Regional Football Landscape</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {city.region} offers a diverse and vibrant football ecosystem that supports youth 
                  development at all levels. The region's commitment to grassroots football is evident 
                  in the quality and quantity of youth tournaments available throughout the year.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Local football associations work closely with tournament organizers to ensure high 
                  standards of competition and player welfare. This collaborative approach has created 
                  a thriving tournament scene that attracts teams from across the UK and beyond.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">What Makes {city.displayName} Special</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Tournaments in {city.displayName} are renowned for their excellent organization, 
                  competitive balance, and welcoming atmosphere. The city's football community prides 
                  itself on providing memorable experiences that go beyond just the matches themselves.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're looking for competitive challenges or development opportunities, 
                  {city.displayName} tournaments offer the perfect environment for young players to 
                  showcase their skills and learn from experienced coaches and officials.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3 text-primary">Quick Facts</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region:</span>
                    <span className="font-medium">{city.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Tournaments:</span>
                    <span className="font-medium">{tournamentCount}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age Categories:</span>
                    <span className="font-medium">U6-U21</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formats:</span>
                    <span className="font-medium">3v3 to 11v11</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
                <h4 className="font-semibold mb-3 text-primary">Find Nearby Cities</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Explore tournaments in neighboring areas for more opportunities.
                </p>
                <Link to="/" className="text-primary text-sm hover:underline">
                  Browse All UK Cities →
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Footer Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Join the {city.displayName} Football Community</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ready to get involved in youth football tournaments in {city.displayName}? Whether you're 
              a player, parent, coach, or organizer, there are opportunities for everyone to participate 
              in our vibrant football community. From grassroots development to competitive tournaments, 
              {city.displayName} offers something for every young footballer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-primary text-primary-foreground">Youth Development</Badge>
              <Badge className="bg-secondary text-secondary-foreground">All Skill Levels</Badge>
              <Badge className="bg-accent text-accent-foreground">Community Focused</Badge>
              <Badge className="bg-success text-success-foreground">Safe Environment</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};