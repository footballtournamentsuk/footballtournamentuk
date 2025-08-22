import { useState, useMemo, useEffect } from 'react';
import TournamentCard from '@/components/TournamentCard';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import TournamentFilters from '@/components/TournamentFilters';
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer';
import Map from '@/components/Map';
import { SEO } from '@/components/SEO';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFilterSync } from '@/hooks/useFilterSync';
import { useEngagementTracker } from '@/hooks/useEngagementTracker';
import { trackTournamentListView } from '@/hooks/useAnalyticsEvents';
import { Tournament, TournamentFilters as Filters } from '@/types/tournament';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { AlertSubscriptionBanner } from '@/components/alerts/AlertSubscriptionBanner';

// Haversine formula to calculate distance between two coordinates in miles
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

const Tournaments = () => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const { filters, setFilters, clearFilters } = useFilterSync();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { trackMeaningfulAction } = useEngagementTracker();
  const {
    tournaments,
    loading,
    error
  } = useTournaments();

  // Pull to refresh functionality
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      // Refresh page data - in a real app, you'd call refetch functions
      window.location.reload();
    }
  });

  // Filter and separate tournaments
  const {
    upcomingTournaments,
    pastTournaments,
    allFilteredTournaments
  } = useMemo(() => {
    let filtered = tournaments;

    // When filtering by region, exclude demo tournaments to show only real data
    if (filters.regions && filters.regions.length > 0) {
      filtered = filtered.filter(tournament => 
        tournament.organizerId !== 'demo' && !tournament.id.startsWith('demo-')
      );
    }

    // Apply search query from filters
    if (filters.search?.trim()) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(tournament => 
        tournament.name.toLowerCase().includes(query) || 
        tournament.description?.toLowerCase().includes(query) || 
        tournament.location.name.toLowerCase().includes(query) || 
        tournament.location.region.toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter(tournament => {
        const tournamentStart = new Date(tournament.dates.start);
        const tournamentEnd = new Date(tournament.dates.end);
        
        if (filters.dateRange!.start && !filters.dateRange!.end) {
          return tournamentStart >= filters.dateRange!.start;
        }
        
        if (!filters.dateRange!.start && filters.dateRange!.end) {
          return tournamentStart <= filters.dateRange!.end;
        }
        
        if (filters.dateRange!.start && filters.dateRange!.end) {
          return tournamentStart <= filters.dateRange!.end && tournamentEnd >= filters.dateRange!.start;
        }
        
        return true;
      });
    }

    // Apply location and radius filter
    if (filters.location?.postcode && filters.location?.coordinates) {
      const userCoords = filters.location.coordinates;
      const maxDistance = filters.location.radius || 25; // Default 25 miles radius
      
      filtered = filtered.filter(tournament => {
        if (!tournament.location.coordinates) return false; // Exclude tournaments without coordinates
        
        const distance = calculateDistance(
          userCoords[1], // lat
          userCoords[0], // lng
          tournament.location.coordinates[1], // lat
          tournament.location.coordinates[0] // lng
        );
        
        return distance <= maxDistance;
      });
    }

    // Apply price range filter
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) {
      filtered = filtered.filter(tournament => {
        const price = tournament.cost?.amount || 0;
        
        if (filters.priceRange!.min !== undefined && price < filters.priceRange!.min) {
          return false;
        }
        
        if (filters.priceRange!.max !== undefined && price > filters.priceRange!.max) {
          return false;
        }
        
        return true;
      });
    }

    // Apply format filter
    if (filters.format && filters.format.length > 0) {
      filtered = filtered.filter(tournament => {
        // Handle both single format and comma-separated formats
        const tournamentFormats = tournament.format.split(',').map(f => f.trim());
        return filters.format!.some(selectedFormat => 
          tournamentFormats.includes(selectedFormat)
        );
      });
    }

    // Apply age groups filter
    if (filters.ageGroups && filters.ageGroups.length > 0) {
      filtered = filtered.filter(tournament => 
        tournament.ageGroups.some(ageGroup => 
          filters.ageGroups!.includes(ageGroup)
        )
      );
    }

    // Apply team types filter
    if (filters.teamTypes && filters.teamTypes.length > 0) {
      filtered = filtered.filter(tournament => 
        tournament.teamTypes.some(type => filters.teamTypes!.includes(type))
      );
    }

    // Apply tournament type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(tournament => 
        filters.type!.includes(tournament.type)
      );
    }

    // Apply regions filter
    if (filters.regions && filters.regions.length > 0) {
      // Create a mapping from region slugs to actual region names
      const regionSlugToName: Record<string, string[]> = {
        'england': ['England', 'West Midlands', 'South West England', 'North West England', 'Yorkshire', 'East England', 'South England', 'North East England', 'East Midlands', 'London', 'South East England'],
        'scotland': ['Scotland'],
        'wales': ['Wales'],
        'northern-ireland': ['Northern Ireland']
      };
      
      // Get all possible region names for the selected region slugs
      const targetRegions = filters.regions!.flatMap(regionSlug => {
        // First try exact match (case-insensitive)
        const exactMatch = Object.keys(regionSlugToName).find(key => 
          key.toLowerCase() === regionSlug.toLowerCase()
        );
        if (exactMatch) {
          return regionSlugToName[exactMatch];
        }
        // Fallback to treating it as a region name directly
        return [regionSlug];
      });
      
      filtered = filtered.filter(tournament => 
        targetRegions.some(targetRegion => 
          tournament.location.region.toLowerCase() === targetRegion.toLowerCase()
        )
      );
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(tournament => 
        filters.status!.includes(tournament.status)
      );
    }

    // Sort by distance if location is provided, otherwise by date
    filtered = filtered.sort((a, b) => {
      if (filters.location?.coordinates) {
        const distanceA = a.location.coordinates 
          ? calculateDistance(
              filters.location.coordinates[1], // lat
              filters.location.coordinates[0], // lng
              a.location.coordinates[1], // lat
              a.location.coordinates[0] // lng
            )
          : Infinity;
          
        const distanceB = b.location.coordinates 
          ? calculateDistance(
              filters.location.coordinates[1], // lat
              filters.location.coordinates[0], // lng
              b.location.coordinates[1], // lat
              b.location.coordinates[0] // lng
            )
          : Infinity;
          
        return distanceA - distanceB;
      } else {
        // Sort by date (upcoming first)
        return new Date(a.dates.start).getTime() - new Date(b.dates.start).getTime();
      }
    });

    // Separate upcoming and past tournaments
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming = filtered.filter(tournament => 
      new Date(tournament.dates.start) >= now
    );
    
    const past = filtered.filter(tournament => 
      new Date(tournament.dates.start) < now
    );

    return {
      upcomingTournaments: upcoming,
      pastTournaments: past,
      allFilteredTournaments: filtered
    };
  }, [tournaments, filters]);

  // Track tournament list view when data is available
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Only track if we have tournaments data
    if (tournaments.length > 0) {
      trackTournamentListView({
        ...filters,
        results_count: allFilteredTournaments.length,
      });
    }
  }, [allFilteredTournaments.length, tournaments.length]);

  const handleTournamentSelect = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    trackMeaningfulAction('tournament_selected');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search?.trim()) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.location?.postcode) count++;
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) count++;
    if (filters.format?.length) count++;
    if (filters.ageGroups?.length) count++;
    if (filters.teamTypes?.length) count++;
    if (filters.type?.length) count++;
    if (filters.regions?.length) count++;
    if (filters.status?.length) count++;
    return count;
  };

  return (
    <>
      <div 
        className="min-h-screen" 
        ref={pullToRefresh.bindToContainer}
        data-ptr="true"
      >
        <PullToRefreshIndicator
          isPulling={pullToRefresh.isPulling}
          pullDistance={pullToRefresh.pullDistance}
          isRefreshing={pullToRefresh.isRefreshing}
          canRefresh={pullToRefresh.canRefresh}
        />
        <SEO
        title="Football Tournaments | Search & Find Local Events"
        description="Find and join football tournaments across the UK. Search by location, age group, format (5v5, 7v7, 11v11) and more. All ages and skill levels welcome."
      />
      <ScrollToTop />
      
      <div className="min-h-screen">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Football Tournaments
            </h1>
            <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
              Discover and join football tournaments across the UK. Search by location, format, and age group.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Desktop Filters */}
          {!isMobile && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
              <div className="lg:col-span-1">
                <TournamentFilters 
                  filters={filters} 
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                />
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Tournament List */}
                  <div>
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500 p-8">
                        Error loading tournaments. Please try again.
                      </div>
                    ) : allFilteredTournaments.length === 0 ? (
                      <div className="text-center text-muted-foreground p-8">
                        No tournaments found matching your criteria.
                        <br />
                        <Button 
                          variant="outline" 
                          onClick={clearFilters} 
                          className="mt-4"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Upcoming Tournaments */}
                        {upcomingTournaments.length > 0 && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">
                              Upcoming Tournaments ({upcomingTournaments.length})
                            </h2>
                            <div className="space-y-4">
                              {upcomingTournaments.map((tournament) => (
                                <TournamentCard
                                  key={tournament.id}
                                  tournament={tournament}
                                  onSelect={() => handleTournamentSelect(tournament)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Past Tournaments */}
                        {pastTournaments.length > 0 && (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-between p-4 h-auto"
                              >
                                <span className="text-lg font-semibold">
                                  Past Tournaments ({pastTournaments.length})
                                </span>
                                <ChevronDown className="h-5 w-5" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4">
                              {pastTournaments.map((tournament) => (
                                <TournamentCard
                                  key={tournament.id}
                                  tournament={tournament}
                                  onSelect={() => handleTournamentSelect(tournament)}
                                />
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Map */}
                  <div className="h-[600px]">
                    <Map 
                      tournaments={allFilteredTournaments}
                      selectedTournament={selectedTournament}
                      onTournamentSelect={handleTournamentSelect}
                      centerCoordinates={filters.location?.coordinates}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Layout */}
          {isMobile && (
            <div className="space-y-6">
              {/* Mobile Header with Filter */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Tournaments ({allFilteredTournaments.length})
                </h2>
                <MobileFilterDrawer
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                  activeCount={getActiveFiltersCount()}
                />
              </div>

              {/* Tournament List */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 p-8">
                  Error loading tournaments. Please try again.
                </div>
              ) : allFilteredTournaments.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                  No tournaments found matching your criteria.
                  <br />
                  <Button 
                    variant="outline" 
                    onClick={clearFilters} 
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Tournaments */}
                  {upcomingTournaments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Upcoming ({upcomingTournaments.length})
                      </h3>
                      <div className="space-y-4">
                        {upcomingTournaments.map((tournament) => (
                          <TournamentCard
                            key={tournament.id}
                            tournament={tournament}
                            onSelect={() => handleTournamentSelect(tournament)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Tournaments */}
                  {pastTournaments.length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between p-4 h-auto"
                        >
                          <span className="font-semibold">
                            Past Tournaments ({pastTournaments.length})
                          </span>
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4">
                        {pastTournaments.map((tournament) => (
                          <TournamentCard
                            key={tournament.id}
                            tournament={tournament}
                            onSelect={() => handleTournamentSelect(tournament)}
                          />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}

              {/* Map Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Tournament Locations</h3>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <Map 
                    tournaments={allFilteredTournaments}
                    selectedTournament={selectedTournament}
                    onTournamentSelect={handleTournamentSelect}
                    centerCoordinates={filters.location?.coordinates}
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tournaments;