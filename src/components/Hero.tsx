import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Trophy, Search } from 'lucide-react';
import heroImage from '@/assets/hero-football.jpg';

const Hero: React.FC = () => {
  const scrollToMap = () => {
    const mapSection = document.getElementById('tournament-map');
    mapSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTournaments = () => {
    const tournamentsSection = document.getElementById('tournaments');
    tournamentsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Youth football players in action" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-secondary/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-4"
          >
            🏆 UK's Premier Youth Football Platform
          </Badge>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Discover Youth Football
          <span className="block bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
            Tournaments Across the UK
          </span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 leading-relaxed text-white/90 max-w-3xl mx-auto">
          Find the perfect tournament for your team. From 3-a-side mini soccer to 11-a-side competitions, 
          discover leagues, camps, and tournaments for all age groups across England, Scotland, Wales, and Northern Ireland.
        </p>

        {/* Key Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">UK Wide</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">All Ages</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">All Formats</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Real-time</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={scrollToMap}
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 text-lg shadow-lg"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Explore Map
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={scrollToTournaments}
            className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 text-lg"
          >
            <Search className="w-5 h-5 mr-2" />
            Browse Tournaments
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">500+</div>
            <div className="text-white/80">Tournaments</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">50+</div>
            <div className="text-white/80">Leagues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">5K+</div>
            <div className="text-white/80">Teams</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;