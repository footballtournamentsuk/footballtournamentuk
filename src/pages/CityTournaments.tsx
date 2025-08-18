import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFilterSync } from '@/hooks/useFilterSync';
import { HelmetProvider } from 'react-helmet-async';
import CityHero from '@/components/CityHero';
import CityOrganizerCTA from '@/components/CityOrganizerCTA';
import Map from '@/components/Map';
import TournamentFilters from '@/components/TournamentFilters';
import TournamentCard from '@/components/TournamentCard';
import { SEO } from '@/components/SEO';
import { CityContent } from '@/components/CityContent';
import { EnhancedSEO } from '@/components/EnhancedSEO';
import { InternalLinking } from '@/components/InternalLinking';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { Tournament, TournamentFilters as Filters } from '@/types/tournament';
import { getCityBySlug, UK_CITIES } from '@/data/cities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Settings, ArrowLeft, MapPin, Calendar, Trophy, Search } from 'lucide-react';

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

const CityTournaments = () => {
  const { citySlug, param } = useParams<{ citySlug?: string; param?: string }>();
  const slugToUse = citySlug || param;
  const city = getCityBySlug(slugToUse || '');
  
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const { filters, setFilters, clearFilters } = useFilterSync();
  const [showFilters, setShowFilters] = useState(false);
  const { tournaments, loading, error } = useTournaments();
  const { user } = useAuth();

  // Filter tournaments by city/region
  const { cityTournaments, upcomingTournaments, pastTournaments } = useMemo(() => {
    if (!city) return { cityTournaments: [], upcomingTournaments: [], pastTournaments: [] };

    // Filter tournaments for this city/region
    let filtered = tournaments.filter(tournament => {
      // Match by region or city name in location
      return tournament.location.region === city.region ||
             tournament.location.name.toLowerCase().includes(city.displayName.toLowerCase()) ||
             tournament.location.region.toLowerCase().includes(city.displayName.toLowerCase());
    }).map(tournament => {
      // Fix coordinates for tournaments that have incorrect coordinates
      // If tournament location name or region matches this city but coordinates are far away,
      // use the city's coordinates instead
      const [tournamentLng, tournamentLat] = tournament.location.coordinates;
      const [cityLng, cityLat] = city.coordinates;
      
      // Calculate rough distance (simplified)
      const lngDiff = Math.abs(tournamentLng - cityLng);
      const latDiff = Math.abs(tournamentLat - cityLat);
      
      // If coordinates are more than ~1 degree away (roughly 100km), they're likely wrong
      if (lngDiff > 1 || latDiff > 1) {
        return {
          ...tournament,
          location: {
            ...tournament.location,
            coordinates: city.coordinates as [number, number]
          }
        };
      }
      
      return tournament;
    });

    // Apply search query from filters
    if (filters.search?.trim()) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(tournament => 
        tournament.name.toLowerCase().includes(query) || 
        tournament.description?.toLowerCase().includes(query) || 
        tournament.location.name.toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter(tournament => {
        const tournamentStart = new Date(tournament.dates.start);
        const tournamentEnd = new Date(tournament.dates.end);
        
        // If only 'start' date is set, check if tournament starts on or after this date
        if (filters.dateRange!.start && !filters.dateRange!.end) {
          return tournamentStart >= filters.dateRange!.start;
        }
        
        // If only 'end' date is set, check if tournament starts on or before this date
        if (!filters.dateRange!.start && filters.dateRange!.end) {
          return tournamentStart <= filters.dateRange!.end;
        }
        
        // If both dates are set, check if tournament overlaps with the date range
        if (filters.dateRange!.start && filters.dateRange!.end) {
          return tournamentStart <= filters.dateRange!.end && tournamentEnd >= filters.dateRange!.start;
        }
        
        return true;
      });
    }

    // Apply location and radius filter
    if (filters.location?.postcode && filters.location?.coordinates && filters.location?.radius) {
      const userCoords = filters.location.coordinates;
      const maxDistance = filters.location.radius;
      
      filtered = filtered.filter(tournament => {
        if (!tournament.location.coordinates || tournament.location.coordinates.length !== 2) {
          return false;
        }
        
        const tournamentCoords = tournament.location.coordinates;
        const distance = calculateDistance(
          userCoords[1], userCoords[0], // lat, lng for user
          tournamentCoords[1], tournamentCoords[0] // lat, lng for tournament
        );
        
        return distance <= maxDistance;
      });
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(tournament => {
        const cost = tournament.cost?.amount;
        const isFree = !cost || cost === 0;
        
        // If includeFree is true and tournament is free, include it
        if (filters.priceRange!.includeFree && isFree) {
          return true;
        }
        
        // If we only want free tournaments and this is free
        if (filters.priceRange!.includeFree && !filters.priceRange!.min && !filters.priceRange!.max && isFree) {
          return true;
        }
        
        // If tournament is free but includeFree is false, exclude it
        if (isFree && !filters.priceRange!.includeFree) {
          return false;
        }
        
        // Apply min/max price filters for paid tournaments
        if (!isFree) {
          const min = filters.priceRange!.min;
          const max = filters.priceRange!.max;
          
          if (min !== undefined && cost! < min) {
            return false;
          }
          if (max !== undefined && max < 500 && cost! > max) {
            return false;
          }
          
          return true;
        }
        
        // If we get here and only have price range without includeFree, 
        // and the tournament is free, exclude it
        return false;
      });
    }

    // Apply other filters
    if (filters.format?.length) {
      filtered = filtered.filter(t => filters.format!.includes(t.format));
    }
    
    if (filters.ageGroups?.length) {
      filtered = filtered.filter(t => 
        t.ageGroups.some(age => filters.ageGroups!.includes(age))
      );
    }
    
    if (filters.teamTypes?.length) {
      filtered = filtered.filter(t => 
        t.teamTypes.some(type => filters.teamTypes!.includes(type))
      );
    }
    
    if (filters.type?.length) {
      filtered = filtered.filter(t => filters.type!.includes(t.type));
    }
    
    if (filters.status?.length) {
      filtered = filtered.filter(t => filters.status!.includes(t.status));
    }

    // Separate upcoming and past tournaments
    const upcoming = filtered.filter(t => 
      !['completed', 'cancelled'].includes(t.status)
    ).sort((a, b) => {
      return new Date(a.dates.start).getTime() - new Date(b.dates.start).getTime();
    });

    const past = filtered.filter(t => 
      ['completed', 'cancelled'].includes(t.status)
    ).sort((a, b) => {
      return new Date(b.dates.start).getTime() - new Date(a.dates.start).getTime();
    });

    return { 
      cityTournaments: filtered, 
      upcomingTournaments: upcoming, 
      pastTournaments: past 
    };
  }, [tournaments, city, filters]);

  const handleTournamentSelect = (tournament: Tournament | null) => {
    setSelectedTournament(tournament);
  };

  // clearFilters is now provided by useFilterSync hook

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  );

  const scrollToMap = () => {
    const mapSection = document.getElementById('tournament-map');
    mapSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTournaments = () => {
    const tournamentsSection = document.getElementById('tournaments');
    tournamentsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  // If city not found, show 404
  if (!city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">City Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The city "{slugToUse}" is not in our database.
          </p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = `Youth Football Tournaments in ${city.displayName} | UK Youth Football`;
  const pageDescription = city.seoDescription;

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background">
        <SEO 
          title={pageTitle}
          description={pageDescription}
          canonicalUrl={`/city/${city.slug}`}
          tournaments={upcomingTournaments.slice(0, 5)}
          cityName={city.displayName}
        />
        
        <EnhancedSEO 
          city={city}
          tournaments={upcomingTournaments}
          pageType="city"
          additionalKeywords={[
            `${city.displayName} youth football`,
            `${city.displayName} football clubs`,
            `${city.displayName} sports tournaments`,
            `youth development ${city.region}`
          ]}
        />

        {/* City Hero Section */}
        <CityHero 
          city={city}
          tournamentCount={upcomingTournaments.length}
          onScrollToMap={scrollToMap}
          onScrollToTournaments={scrollToTournaments}
        />

        {/* Breadcrumb Navigation */}
        <div className="bg-surface py-4">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{city.displayName} Tournaments</span>
            </nav>
          </div>
        </div>

        {/* SEO Intro Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-warning animate-pulse" />
                Youth Football Tournaments in {city.displayName}
                <Trophy className="w-8 h-8 text-warning animate-pulse" />
              </h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p>{city.introText}</p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-surface rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-6 h-6 text-emerald-500 mr-2" />
                    <span className="text-2xl font-bold text-emerald-500">{upcomingTournaments.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Upcoming Tournaments</p>
                </div>
                <div className="bg-surface rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-6 h-6 text-blue-500 mr-2" />
                    <span className="text-2xl font-bold text-blue-500">{city.region}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Coverage Area</p>
                </div>
                <div className="bg-surface rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6 text-orange-500 mr-2" />
                    <span className="text-2xl font-bold text-orange-500">All</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Age Groups & Formats</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section id="tournament-map" className="py-16 bg-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tournament Map - {city.displayName}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore tournaments across {city.displayName} and {city.region}. Click on any marker to view tournament details.
              </p>
            </div>
            
            <Map 
              tournaments={upcomingTournaments}
              selectedTournament={selectedTournament}
              onTournamentSelect={handleTournamentSelect}
              centerCoordinates={city.coordinates}
              defaultZoom={11}
            />
          </div>
        </section>

        {/* Tournaments Section */}
        <section id="tournaments" className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar - Filters */}
              <div className="lg:w-1/3">
                <div className="sticky top-4 space-y-6">
                  {/* Back to All Cities */}
                  <div className="mb-4">
                    <Link to="/">
                      <Button variant="outline" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Tournaments
                      </Button>
                    </Link>
                  </div>

                  {/* Search and Add Tournament */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Find in {city.displayName}</h2>
                      <div className="flex gap-2">
                        {user ? (
                          <Button variant="default" size="sm" asChild>
                            <Link to="/profile">
                              <Settings className="w-4 h-4 mr-2" />
                              Profile
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="default" size="sm" asChild>
                            <Link to="/auth">
                              <Plus className="w-4 h-4 mr-2" />
                              Sign In to Add
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="ml-2">
                            Active
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                    <TournamentFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClearFilters={clearFilters}
                    />
                  </div>

                  {/* Other Cities Quick Links */}
                  <div className="bg-surface rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Other Cities</h3>
                    <div className="grid grid-cols-2 gap-2">
                  {UK_CITIES.filter(c => c.slug !== city.slug).slice(0, 6).map(otherCity => (
                        <Link 
                          key={otherCity.slug} 
                          to={`/city/${otherCity.slug}`}
                          className="text-xs bg-background hover:bg-muted rounded px-2 py-1 transition-colors"
                        >
                          {otherCity.displayName}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Tournament Cards */}
              <div className="lg:w-2/3">
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">Error loading tournaments: {error}</p>
                  </div>
                )}
                
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {loading ? 'Loading...' : `${cityTournaments.length} Tournament${cityTournaments.length !== 1 ? 's' : ''} Found in ${city.displayName}`}
                    </h3>
                    {hasActiveFilters && !loading && (
                      <p className="text-sm text-muted-foreground">
                        Showing filtered results
                      </p>
                    )}
                  </div>
                  
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-muted rounded-lg h-48"></div>
                    ))}
                  </div>
                ) : cityTournaments.length === 0 ? (
                  <div className="text-center py-16 bg-surface rounded-lg">
                    <div className="max-w-lg mx-auto">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-emerald-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-foreground">
                        No tournaments yet in {city.displayName}
                      </h3>
                      <div className="space-y-3 text-muted-foreground mb-8">
                        <p className="text-lg">
                          We're actively working to bring exciting youth football tournaments to {city.displayName} and the {city.region} area.
                        </p>
                        <p>
                          Check back soon or explore tournaments in nearby cities. You can also sign up to get notified when new tournaments are announced in your area.
                        </p>
                      </div>
                      
                      {/* Key Features Still Available */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full flex items-center justify-center mb-2">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">{city.region}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-2">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">All Formats</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full flex items-center justify-center mb-2">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">Coming Soon</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center mb-2">
                            <Search className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">Stay Updated</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {hasActiveFilters && (
                          <Button onClick={clearFilters} variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Clear Filters
                          </Button>
                        )}
                        <Link to="/">
                          <Button variant="default" size="lg">
                            <MapPin className="w-4 h-4 mr-2" />
                            View All UK Tournaments
                          </Button>
                        </Link>
                        {!user && (
                          <Link to="/auth">
                            <Button variant="secondary" size="lg">
                              <Plus className="w-4 h-4 mr-2" />
                              Sign Up for Updates
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Upcoming Tournaments */}
                    {upcomingTournaments.length > 0 && (
                      <div>
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-foreground">
                            Upcoming Tournaments in {city.displayName} ({upcomingTournaments.length})
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Sorted by start date - soonest first
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {upcomingTournaments.map(tournament => (
                            <TournamentCard
                              key={tournament.id}
                              tournament={tournament}
                              onSelect={handleTournamentSelect}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Tournaments - Collapsible */}
                    {pastTournaments.length > 0 && (
                      <div className="border-t pt-8">
                        <details className="group">
                          <summary className="cursor-pointer mb-4 flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-muted transition-colors">
                            <div>
                              <h4 className="text-lg font-semibold text-foreground">
                                Past Tournaments in {city.displayName} ({pastTournaments.length})
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Completed and cancelled tournaments
                              </p>
                            </div>
                            <div className="text-muted-foreground group-open:rotate-90 transition-transform">
                              ▶
                            </div>
                          </summary>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            {pastTournaments.map(tournament => (
                              <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                onSelect={handleTournamentSelect}
                              />
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* City-Specific Organizer CTA */}
        <CityOrganizerCTA city={city} />

        {/* Enhanced City Content Section */}
        <CityContent city={city} tournamentCount={upcomingTournaments.length} />
        
        {/* Internal Linking Section */}
        <InternalLinking currentCity={city} tournamentCount={upcomingTournaments.length} />

      </div>
    </HelmetProvider>
  );
};

export default CityTournaments;
