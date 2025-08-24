import React from 'react';
import { Tournament } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Trophy, ArrowDown } from 'lucide-react';
import { isDemoTournament } from '@/utils/demoUtils';

interface ShareHeroProps {
  tournament: Tournament;
  onScrollToDetails?: () => void;
}

export const ShareHero: React.FC<ShareHeroProps> = ({ 
  tournament, 
  onScrollToDetails 
}) => {
  const isDemo = isDemoTournament(tournament);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-neutral text-neutral-foreground';
      case 'ongoing':
        return 'bg-destructive text-destructive-foreground';
      case 'today':
        return 'bg-warning text-warning-foreground';
      case 'tomorrow':
        return 'bg-accent text-accent-foreground';
      case 'registration_open':
        return 'bg-success text-success-foreground';
      case 'registration_closes_soon':
        return 'bg-warning text-warning-foreground';
      case 'registration_closed':
        return 'bg-neutral text-neutral-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'league':
        return 'bg-primary text-primary-foreground';
      case 'tournament':
        return 'bg-secondary text-secondary-foreground';
      case 'camp':
        return 'bg-accent text-accent-foreground';
      case 'holiday':
        return 'bg-football-green text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Determine the share cover image and aspect ratio
  const shareCoverUrl = tournament.share_cover_url || tournament.banner_url;
  const shareVariant = tournament.share_cover_variant || 'FB_1200x630';
  
  // Get aspect ratio class based on variant
  const getAspectRatioClass = () => {
    switch (shareVariant) {
      case 'IG_1080x1350':
        return 'aspect-[4/5]'; // Instagram Portrait
      case 'IG_1080x1080':
        return 'aspect-square'; // Instagram Square  
      case 'FB_1200x630':
      default:
        return 'aspect-[1200/630]'; // Facebook/Twitter
    }
  };

  const altText = tournament.share_cover_alt || 
    `${tournament.name} - ${tournament.format} ${tournament.type} tournament in ${tournament.location.name}`;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-primary/90 to-primary-glow/90">
      {/* Background Image Container */}
      <div className={`relative w-full ${getAspectRatioClass()}`}>
        {shareCoverUrl ? (
          <img
            src={shareCoverUrl}
            alt={altText}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
            sizes="100vw"
          />
        ) : (
          // Fallback gradient background
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow" />
        )}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            {/* Status and Type Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge className={`${getStatusColor(tournament.status)} border-white/20`}>
                {tournament.status.replace(/_/g, ' ')}
              </Badge>
              <Badge className={`${getTypeColor(tournament.type)} border-white/20`}>
                {tournament.type}
              </Badge>
              {isDemo && (
                <Badge className="bg-orange-500 text-white font-bold animate-pulse border-orange-400">
                  DEMO
                </Badge>
              )}
            </div>

            {/* Tournament Name */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-shadow-lg">
              {tournament.name}
            </h1>
            
            {isDemo && (
              <div className="text-lg text-orange-200 font-medium mb-4">
                This is a demo listing for illustration purposes
              </div>
            )}

            {/* Key Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-white/90">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{tournament.location.name}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  {formatDate(tournament.dates.start)} - {formatDate(tournament.dates.end)}
                </span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Users className="w-5 h-5" />
                <span className="font-medium">{tournament.format}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">{tournament.ageGroups.join(', ')}</span>
              </div>
            </div>

            {/* Cost Information */}
            {tournament.cost && (
              <div className="text-2xl md:text-3xl font-bold mb-6 text-white">
                £{tournament.cost.amount} per team
              </div>
            )}

            {/* View Details Button */}
            {onScrollToDetails && (
              <Button 
                onClick={onScrollToDetails}
                variant="secondary"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                View Details
                <ArrowDown className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};