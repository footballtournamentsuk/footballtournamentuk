import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Trophy, List } from 'lucide-react';
import heroImage from '@/assets/hero-football.jpg';
import { CityConfig } from '@/data/cities';

interface CityHeroProps {
  city: CityConfig;
  tournamentCount: number;
  onScrollToMap: () => void;
  onScrollToTournaments: () => void;
}

const CityHero: React.FC<CityHeroProps> = ({ 
  city, 
  tournamentCount, 
  onScrollToMap, 
  onScrollToTournaments 
}) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt={`Youth football players in ${city.displayName}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-4"
          >
            🏆 {city.displayName} Youth Football Tournaments
          </Badge>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Find Youth Football Tournaments in
          <span className="block bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
            {city.displayName}
          </span>
        </h1>

        <h2 className="text-xl md:text-2xl mb-6 leading-relaxed text-white/90 max-w-3xl mx-auto font-semibold">
          Discover {tournamentCount > 0 ? tournamentCount : ''} exciting football tournaments and events in {city.displayName} and {city.region}. From grassroots to elite competitions.
        </h2>

        <div className="text-lg md:text-xl mb-8 leading-relaxed text-white/80 max-w-3xl mx-auto">
          <p className="mb-4">{city.introText}</p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full flex items-center justify-center mb-2 shadow-lg hover:scale-110 transition-all duration-300 hero-pulse">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">{city.region}</span>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-2 shadow-lg hover:scale-110 transition-all duration-300 hero-pulse">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">All Ages</span>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full flex items-center justify-center mb-2 shadow-lg hover:scale-110 transition-all duration-300 hero-pulse">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">All Formats</span>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center mb-2 shadow-lg hover:scale-110 transition-all duration-300 hero-pulse">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">Real-time</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={onScrollToMap}
            className="bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-xl font-semibold px-8 py-4 text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <MapPin className="w-5 h-5 mr-2" />
            View {city.displayName} Map
          </Button>
          <Button 
            size="lg" 
            onClick={onScrollToTournaments}
            className="bg-orange-500 text-white hover:bg-orange-600 hover:shadow-xl font-semibold px-8 py-4 text-lg shadow-lg transition-all duration-300 transform hover:scale-105 border-0"
          >
            <List className="w-5 h-5 mr-2" />
            Browse Local Tournaments
          </Button>
        </div>

        {/* Stats */}
        {tournamentCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-emerald-400 mr-2" />
                <div className="text-3xl font-bold text-emerald-400">
                  {tournamentCount}
                </div>
              </div>
              <div className="text-white/80 font-medium">Local Tournaments</div>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-blue-400 mr-2" />
                <div className="text-3xl font-bold text-blue-400">
                  {city.displayName}
                </div>
              </div>
              <div className="text-white/80 font-medium">& Surrounding Areas</div>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-orange-400 mr-2" />
                <div className="text-3xl font-bold text-orange-400">
                  All
                </div>
              </div>
              <div className="text-white/80 font-medium">Age Groups Welcome</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CityHero;