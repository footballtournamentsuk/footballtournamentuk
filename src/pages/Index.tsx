import { useState, useMemo } from 'react';
import TournamentCard from '@/components/TournamentCard';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import TournamentFilters from '@/components/TournamentFilters';
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer';
import Map from '@/components/Map';
import Hero from '@/components/Hero';
import OrganizerCTA from '@/components/OrganizerCTA';
import { ReviewsSection } from '@/components/ReviewsSection';
import { SEO } from '@/components/SEO';
import { CookieConsent } from '@/components/CookieConsent';
import { ScrollToTop } from '@/components/ScrollToTop';
import PartnersCarousel from '@/components/PartnersCarousel';
import OnboardingModal from '@/components/OnboardingModal';
import FeedbackBlock from '@/components/FeedbackBlock';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useFilterSync } from '@/hooks/useFilterSync';
import { Tournament, TournamentFilters as Filters } from '@/types/tournament';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter } from 'lucide-react';

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

const Index = () => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const { filters, setFilters, clearFilters } = useFilterSync();
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  const {
    tournaments,
    loading,
    error
  } = useTournaments();
  const {
    user
  } = useAuth();
  const { isOnboardingOpen, closeOnboarding } = useOnboarding();

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
        
        return false;
      });
    }

    // Apply other filters
    if (filters.format?.length) {
      filtered = filtered.filter(t => filters.format!.includes(t.format));
    }
    if (filters.ageGroups?.length) {
      filtered = filtered.filter(t => t.ageGroups.some(age => filters.ageGroups!.includes(age)));
    }
    if (filters.teamTypes?.length) {
      filtered = filtered.filter(t => t.teamTypes.some(type => filters.teamTypes!.includes(type)));
    }
    if (filters.type?.length) {
      filtered = filtered.filter(t => filters.type!.includes(t.type));
    }
    if (filters.regions?.length) {
      filtered = filtered.filter(t => filters.regions!.includes(t.location.region));
    }
    if (filters.status?.length) {
      filtered = filtered.filter(t => filters.status!.includes(t.status));
    }

    // Separate upcoming and past tournaments
    const upcoming = filtered.filter(t => !['completed', 'cancelled'].includes(t.status)).sort((a, b) => {
      // Sort upcoming by start date ascending (soonest first)
      return new Date(a.dates.start).getTime() - new Date(b.dates.start).getTime();
    });
    const past = filtered.filter(t => ['completed', 'cancelled'].includes(t.status)).sort((a, b) => {
      // Sort past by start date descending (most recent first)
      return new Date(b.dates.start).getTime() - new Date(a.dates.start).getTime();
    });
    return {
      upcomingTournaments: upcoming,
      pastTournaments: past,
      allFilteredTournaments: [...upcoming, ...past]
    };
  }, [tournaments, filters]);

  const handleTournamentSelect = (tournament: Tournament | null) => {
    setSelectedTournament(tournament);
  };

  // clearFilters is now provided by useFilterSync hook

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location?.postcode) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) count++;
    
    // Count array filters
    Object.values(filters).forEach(value => {
      if (Array.isArray(value) && value.length > 0) count++;
    });
    
    return count;
  };
  
  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <div 
      className="min-h-screen bg-background" 
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
        title="Football Tournaments UK – Youth, Adult & Grassroots Competitions"
        description="Find and join football tournaments across the UK. Free listings for organizers – no fees, no contracts."
        canonicalUrl="/"
        tournaments={upcomingTournaments.slice(0, 5)}
        isHomePage={true}
      />
      
      {/* Hero Section */}
      <Hero onHeroSearch={(searchTerm, postcode, coordinates) => {
        const newFilters: Filters = { ...filters };
        
        if (searchTerm) {
          newFilters.search = searchTerm;
        }
        
        if (postcode && coordinates) {
          newFilters.location = {
            postcode,
            coordinates,
            radius: 25 // Default 25 mile radius
          };
        }
        
        setFilters(newFilters);
        
        // Scroll to tournaments section after search
        setTimeout(() => {
          const tournamentsSection = document.getElementById('tournaments');
          tournamentsSection?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }} />

      {/* Partners Section */}
      <section className="py-12 bg-surface/50">
        <div className="container mx-auto px-4">
          <PartnersCarousel />
        </div>
      </section>

      {/* Organizer CTA Section */}
      <OrganizerCTA />

      {/* Map Section */}
      <section id="tournament-map" className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tournament Map
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore tournaments across the UK. Click on any marker to view tournament details 
              and get directions to the venue.
            </p>
          </div>
          
          <Map tournaments={upcomingTournaments} selectedTournament={selectedTournament} onTournamentSelect={handleTournamentSelect} />
        </div>
      </section>

      {/* Tournament Listings */}
      <section id="tournaments" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Mobile Filter Button */}
              {isMobile ? (
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Football Tournaments
                  </h2>
                  <MobileFilterDrawer
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={clearFilters}
                    activeCount={getActiveFiltersCount()}
                  />
                </div>
              ) : (
                <>
                  {/* Desktop Filter Sidebar */}
                  <div className="lg:w-1/3 xl:w-1/4">
                    <div className="mb-6">
                      <TournamentFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClearFilters={clearFilters}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Tournament Results */}
              <div className={isMobile ? "w-full" : "lg:w-2/3 xl:w-3/4"}>
                {!isMobile && (
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      Football Tournaments
                    </h2>
                  </div>
                )}

                {loading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64"></div>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">Error loading tournaments: {error}</p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    {/* Upcoming Tournaments */}
                    {upcomingTournaments.length > 0 && (
                      <div className="mb-12">
                        <h3 className="text-xl font-semibold mb-6 text-foreground">
                          Upcoming Tournaments ({upcomingTournaments.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
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
                            className="flex items-center gap-2 text-lg font-medium mb-4 hover:bg-accent/50"
                          >
                            <ChevronDown className="w-5 h-5" />
                            Past Tournaments ({pastTournaments.length})
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                            {pastTournaments.map((tournament) => (
                              <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                onSelect={() => handleTournamentSelect(tournament)}
                              />
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {upcomingTournaments.length === 0 && pastTournaments.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          No tournaments found matching your criteria.
                        </p>
                        {hasActiveFilters && (
                          <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* FAQ Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4 max-w-4xl">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left group">
              <div className="text-center flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything you need to know about our free football tournament bulletin board
                </p>
              </div>
              <ChevronDown className="w-6 h-6 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 ml-4 flex-shrink-0" />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-6">
              <div className="space-y-4">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                    <h3 className="text-lg font-semibold">What is Football Tournaments UK?</h3>
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                    <p className="text-muted-foreground">
                      Football Tournaments UK is a completely free bulletin board platform for football tournaments across the United Kingdom. 
                      We connect tournament organizers with teams, players, and families looking for competitive opportunities. Think of us as 
                      a digital noticeboard where organizers can list their events and teams can discover tournaments in their area.
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                    <h3 className="text-lg font-semibold">Do you charge any fees?</h3>
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                    <p className="text-muted-foreground">
                      <strong>No, never.</strong> Our platform is completely free for both tournament organizers and teams. 
                      There are no listing fees, no commission charges, no subscription costs, and no hidden charges. 
                      We believe youth football should be accessible to everyone, and we're committed to keeping our service free forever.
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                    <h3 className="text-lg font-semibold">How can organizers list their tournaments?</h3>
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                    <p className="text-muted-foreground">
                      Tournament organizers can create a free account and add their events through our simple online form. 
                      You can include all the important details like dates, location, age groups, team format, entry fees, 
                      contact information, and registration deadlines. Once submitted, tournaments are immediately visible to 
                      teams and families searching our platform.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* FAQ Schema Markup for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Football Tournaments UK?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Football Tournaments UK is a completely free bulletin board platform for football tournaments across the United Kingdom. We connect tournament organizers with teams, players, and families looking for competitive opportunities."
                }
              },
              {
                "@type": "Question",
                "name": "Do you charge any fees?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, never. Our platform is completely free for both tournament organizers and teams. There are no listing fees, no commission charges, no subscription costs, and no hidden charges."
                }
              }
            ]
          })}
        </script>
      </section>

      {/* Feedback Block */}
      <FeedbackBlock />

      <CookieConsent />
      <ScrollToTop />
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={closeOnboarding} 
      />
    </div>
  );
};

export default Index;