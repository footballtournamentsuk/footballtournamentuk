import React, { useState, useMemo } from 'react';
import { Tournament } from '@/types/tournament';
import Map from './Map';
import { CityConfig } from '@/data/cities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Trophy, Filter, X, Maximize2, Minimize2 } from 'lucide-react';
import { getCurrencySymbol } from '@/utils/currency';

interface CityMapContainerProps {
  city: CityConfig;
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
  filters?: any;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const CityMapContainer: React.FC<CityMapContainerProps> = ({
  city,
  tournaments,
  selectedTournament,
  onTournamentSelect,
  filters,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);

  // Get unique tournament types with counts
  const tournamentTypeStats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    tournaments.forEach(tournament => {
      typeCounts[tournament.type] = (typeCounts[tournament.type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
  }, [tournaments]);

  // Filter tournaments by active type filter
  const filteredTournaments = useMemo(() => {
    if (!activeTypeFilter) return tournaments;
    return tournaments.filter(tournament => tournament.type === activeTypeFilter);
  }, [tournaments, activeTypeFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'league': 'bg-blue-600 hover:bg-blue-700 text-white',
      'tournament': 'bg-primary hover:bg-primary/90 text-primary-foreground',
      'camp': 'bg-green-600 hover:bg-green-700 text-white',
      'cup': 'bg-amber-500 hover:bg-amber-600 text-white',
      'festival': 'bg-purple-600 hover:bg-purple-700 text-white',
      'showcase': 'bg-orange-600 hover:bg-orange-700 text-white',
      'friendly': 'bg-emerald-600 hover:bg-emerald-700 text-white',
      'holiday': 'bg-pink-600 hover:bg-pink-700 text-white',
    };
    return colors[type] || 'bg-muted hover:bg-muted/80 text-muted-foreground';
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'rounded-lg overflow-hidden'}`}>
      {/* Map Header */}
      <div className="bg-surface border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {city.displayName} Tournament Map
            </h3>
            <p className="text-sm text-muted-foreground">
              Showing {filteredTournaments.length} of {tournaments.length} tournaments
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFullscreen}
                className="flex items-center gap-2"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    Fullscreen
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Type Filters */}
        {tournamentTypeStats.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={!activeTypeFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTypeFilter(null)}
              className="flex items-center gap-1"
            >
              All Types ({tournaments.length})
            </Button>
            {tournamentTypeStats.map(({ type, count }) => (
              <Button
                key={type}
                variant={activeTypeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTypeFilter(type)}
                className={`flex items-center gap-1 ${activeTypeFilter === type ? getTypeColor(type) : ''}`}
              >
                {type} ({count})
              </Button>
            ))}
            {activeTypeFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTypeFilter(null)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Map Component */}
        <div className={isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[520px]'}>
          <Map 
            tournaments={filteredTournaments}
            selectedTournament={selectedTournament}
            onTournamentSelect={onTournamentSelect}
            centerCoordinates={city.coordinates}
            defaultZoom={isFullscreen ? 12 : 11}
            showRadiusCircle={!!filters?.location?.radius}
            searchCenter={filters?.location?.coordinates && filters?.location?.postcode 
              ? filters.location.coordinates 
              : city.coordinates as [number, number]
            }
            searchRadius={filters?.location?.radius || 25}
          />
        </div>

      {/* Enhanced Tournament Info Panel */}
      {selectedTournament && (
        <div className={`absolute ${isFullscreen ? 'top-32 left-4 right-4 max-w-md' : 'top-4 left-4 right-4'} z-30`}>
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">
                    {selectedTournament.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getTypeColor(selectedTournament.type)} variant="secondary">
                      {selectedTournament.type}
                    </Badge>
                    <Badge variant="outline">
                      {selectedTournament.format}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTournamentSelect(null)}
                  className="ml-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium">{selectedTournament.location.name}</div>
                    <div className="text-muted-foreground">
                      {selectedTournament.location.postcode} • {selectedTournament.location.region}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">
                    {formatDate(selectedTournament.dates.start)} - {formatDate(selectedTournament.dates.end)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">
                    {selectedTournament.ageGroups.join(', ')} • {selectedTournament.teamTypes.join(', ')}
                  </span>
                </div>
                
                {selectedTournament.cost && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {getCurrencySymbol(selectedTournament.cost.currency)}{selectedTournament.cost.amount} per team
                    </span>
                  </div>
                )}
              </div>

              {selectedTournament.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedTournament.description}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    // Navigate to tournament details
                    window.location.href = `/tournaments/${selectedTournament.slug || selectedTournament.id}`;
                  }}
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    // Open directions
                    const coords = selectedTournament.location.coordinates;
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
                    window.open(url, '_blank');
                  }}
                >
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CityMapContainer;