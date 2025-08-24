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

  // Determine the share cover image and variant
  const shareCoverUrl = tournament.share_cover_url || tournament.banner_url;
  const shareVariant = tournament.share_cover_variant || 'FB_1200x630';
  
  // Get container dimensions based on variant
  const getContainerStyle = () => {
    let ratio: number;
    let maxWidth: number;
    
    switch (shareVariant) {
      case 'IG_1080x1350':
        ratio = 1080 / 1350;
        maxWidth = 1080;
        break;
      case 'IG_1080x1080':
        ratio = 1;
        maxWidth = 1080;
        break;
      case 'FB_1200x630':
      default:
        ratio = 1200 / 630;
        maxWidth = 1200;
        break;
    }

    return {
      '--ratio': ratio.toString(),
      width: `min(100%, ${maxWidth}px, calc(80svh * ${ratio}))`,
      aspectRatio: ratio.toString(),
    } as React.CSSProperties;
  };

  const altText = tournament.share_cover_alt || 
    `${tournament.name} - ${tournament.format} ${tournament.type} tournament in ${tournament.location.name}`;

  return (
    <div className="w-full py-8 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Centered Share Card */}
        <div className="flex flex-col items-center space-y-6">
          
          {/* Status and Type Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className={getStatusColor(tournament.status)}>
              {tournament.status.replace(/_/g, ' ')}
            </Badge>
            <Badge className={getTypeColor(tournament.type)}>
              {tournament.type}
            </Badge>
            {isDemo && (
              <Badge className="bg-orange-500 text-white font-bold animate-pulse">
                DEMO
              </Badge>
            )}
          </div>

          {/* Centered Image Container */}
          <div 
            className="relative mx-auto rounded-lg overflow-hidden shadow-xl bg-muted"
            style={getContainerStyle()}
          >
            {shareCoverUrl ? (
              <img
                src={shareCoverUrl}
                alt={altText}
                className="absolute inset-0 w-full h-full object-contain"
                loading="eager"
                decoding="async"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            ) : (
              // Fallback with tournament info overlay
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow flex flex-col justify-center items-center p-6 text-white text-center">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  {tournament.name}
                </h2>
                
                {isDemo && (
                  <div className="text-lg text-orange-200 font-medium mb-4">
                    This is a demo listing for illustration purposes
                  </div>
                )}

                {/* Key Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm md:text-base">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{tournament.location.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(tournament.dates.start)} - {formatDate(tournament.dates.end)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{tournament.format}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>{tournament.ageGroups.join(', ')}</span>
                  </div>
                </div>

                {/* Cost Information */}
                {tournament.cost && (
                  <div className="text-xl md:text-2xl font-bold mt-4">
                    £{tournament.cost.amount} per team
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tournament Title (shown below card when image exists) */}
          {shareCoverUrl && (
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {tournament.name}
              </h1>
              
              {isDemo && (
                <div className="text-lg text-orange-600 font-medium mb-4">
                  This is a demo listing for illustration purposes
                </div>
              )}

              {/* Key Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{tournament.location.name}</span>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(tournament.dates.start)} - {formatDate(tournament.dates.end)}
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{tournament.format}</span>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>{tournament.ageGroups.join(', ')}</span>
                </div>
              </div>

              {/* Cost Information */}
              {tournament.cost && (
                <div className="text-2xl font-bold text-primary mb-4">
                  £{tournament.cost.amount} per team
                </div>
              )}
            </div>
          )}

          {/* View Details Button */}
          {onScrollToDetails && (
            <Button 
              onClick={onScrollToDetails}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              View Details
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};