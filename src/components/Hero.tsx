import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Trophy, List, FileText } from 'lucide-react';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';
import { usePreloadHeroImages } from '@/hooks/usePreloadCriticalResources';
import { HeroSearch } from '@/components/HeroSearch';
import heroDesktop from '@/assets/hero-celebration-desktop.webp';
import heroTablet from '@/assets/hero-celebration-tablet.webp';
import heroMobile from '@/assets/hero-celebration-mobile.webp';

interface HeroProps {
  onHeroSearch?: (searchTerm: string, postcode?: string, coordinates?: [number, number]) => void;
}

const Hero: React.FC<HeroProps> = ({ onHeroSearch }) => {
  // Preload critical hero images
  usePreloadHeroImages();
  
  // TODO: Replace with actual database values when available
  // These are realistic starter numbers for a growing platform
  const tournamentsCounter = useCounterAnimation({ 
    end: 120, 
    duration: 2500,
    formatNumber: (num) => num.toString()
  });
  const leaguesCounter = useCounterAnimation({ 
    end: 25, 
    duration: 2000,
    formatNumber: (num) => num.toString()
  });
  const teamsCounter = useCounterAnimation({ 
    end: 1000, 
    duration: 3000,
    formatNumber: (num) => num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString()
  });

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
        <picture>
          {/* Mobile: 4:5 aspect ratio, portrait crop focused on trophy */}
          <source
            media="(max-width: 430px)"
            srcSet={heroMobile}
            width={1200}
            height={1500}
          />
          {/* Tablet: 4:3 aspect ratio */}
          <source
            media="(max-width: 1024px)"
            srcSet={heroTablet}
            width={1600}
            height={1200}
          />
          {/* Desktop: 16:9 aspect ratio */}
          <img
            src={heroDesktop}
            alt="Young football players celebrating with trophy, winners lifting cup with confetti falling"
            className="w-full h-full object-cover object-center"
            width={1920}
            height={1080}
            sizes="100vw"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{ objectPosition: 'center center' }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
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

        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Play. Compete. Win.
          <span className="block bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
            Discover Youth Football Tournaments Across the UK
          </span>
        </h1>

        <h2 className="text-xl md:text-2xl mb-6 leading-relaxed text-white/90 max-w-3xl mx-auto font-semibold">
          From thrilling 3-a-side matches to full 11-a-side championships – find, join, and enjoy the best football tournaments nationwide. All ages, all formats, all in one place.
        </h2>

        <p className="text-lg md:text-xl mb-8 leading-relaxed text-white/80 max-w-3xl mx-auto">
          Whether you're chasing your first goal or lifting the trophy, our platform connects players, coaches, and parents to top youth football events across England, Scotland, Wales, and Northern Ireland. Search by location, date, or format – and get ready for kick-off!
        </p>

        {/* Key Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full flex items-center justify-center mb-2 shadow-lg hover:scale-110 transition-all duration-300 hero-pulse">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">UK Wide</span>
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

        {/* Hero Search */}
        <div className="mb-8">
          <HeroSearch 
            onSearch={(searchTerm, postcode, coordinates) => {
              onHeroSearch?.(searchTerm, postcode, coordinates);
            }}
          />
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={scrollToMap}
            className="bg-white/20 text-white hover:bg-white/30 hover:shadow-xl font-semibold px-6 py-3 text-base shadow-lg transition-all duration-300 transform hover:scale-105 border border-white/30 backdrop-blur-sm"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Explore Map
          </Button>
          <Button 
            size="lg" 
            onClick={scrollToTournaments}
            className="bg-white/20 text-white hover:bg-white/30 hover:shadow-xl font-semibold px-6 py-3 text-base shadow-lg transition-all duration-300 transform hover:scale-105 border border-white/30 backdrop-blur-sm"
          >
            <List className="w-5 h-5 mr-2" />
            Browse All
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20" ref={tournamentsCounter.elementRef}>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-emerald-400 mr-2" />
              <div className="text-3xl font-bold text-emerald-400">
                {tournamentsCounter.formattedValue}
              </div>
            </div>
            <div className="text-white/80 font-medium">Tournaments Listed</div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-blue-400 mr-2" />
              <div className="text-3xl font-bold text-blue-400">
                25+
              </div>
            </div>
            <div className="text-white/80 font-medium">Leagues Available</div>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-orange-400 mr-2" />
              <div className="text-3xl font-bold text-orange-400">
                1K+
              </div>
            </div>
            <div className="text-white/80 font-medium">Teams Registered</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;