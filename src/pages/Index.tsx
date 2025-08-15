import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import OrganizerCTA from '@/components/OrganizerCTA';
import Map from '@/components/Map';
import TournamentFilters from '@/components/TournamentFilters';
import TournamentCard from '@/components/TournamentCard';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { Tournament, TournamentFilters as Filters } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Settings, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
const Index = () => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const {
    tournaments,
    loading,
    error
  } = useTournaments();
  const {
    user
  } = useAuth();

  // Filter and separate tournaments
  const {
    upcomingTournaments,
    pastTournaments
  } = useMemo(() => {
    let filtered = tournaments;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tournament => tournament.name.toLowerCase().includes(query) || tournament.description?.toLowerCase().includes(query) || tournament.location.name.toLowerCase().includes(query) || tournament.location.region.toLowerCase().includes(query));
    }

    // Apply filters
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
      pastTournaments: past
    };
  }, [tournaments, filters, searchQuery]);
  const handleTournamentSelect = (tournament: Tournament | null) => {
    setSelectedTournament(tournament);
  };
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && (Array.isArray(value) ? value.length > 0 : true)) || searchQuery.trim();
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

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

      {/* Tournaments Section */}
      <section id="tournaments" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:w-1/3">
              <div className="sticky top-4 space-y-6">
                {/* Search and Add Tournament */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Find Tournaments</h2>
                    <div className="flex gap-2">
                      {user ? <Button variant="default" size="sm" asChild>
                          <a href="/profile">
                            <Settings className="w-4 h-4 mr-2" />
                            Profile
                          </a>
                        </Button> : <Button variant="default" size="sm" asChild>
                          <a href="/auth">
                            <Plus className="w-4 h-4 mr-2" />
                            Sign In to Add
                          </a>
                        </Button>}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Search tournaments, locations, leagues..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>

                  {/* Mobile Filter Toggle */}
                  <div className="lg:hidden">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowFilters(!showFilters)}
                      className="w-full"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                  <TournamentFilters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />
                </div>
              </div>
            </div>

            {/* Main Content - Tournament Cards */}
            <div className="lg:w-2/3">
              {error && <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">Error loading tournaments: {error}</p>
                </div>}
              
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {loading ? 'Loading...' : `${upcomingTournaments.length + pastTournaments.length} Tournament${upcomingTournaments.length + pastTournaments.length !== 1 ? 's' : ''} Found`}
                  </h3>
                  {hasActiveFilters && !loading && <p className="text-sm text-muted-foreground">
                      Showing filtered results
                    </p>}
                </div>
                
                {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>}
              </div>

              {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-muted rounded-lg h-48"></div>)}
                </div> : upcomingTournaments.length === 0 && pastTournaments.length === 0 ? <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚽</div>
                  <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div> : <div className="space-y-8">
                  {/* Upcoming Tournaments */}
                  {upcomingTournaments.length > 0 && <div>
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-foreground">
                          Upcoming Tournaments ({upcomingTournaments.length})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Sorted by start date - soonest first
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingTournaments.map(tournament => <TournamentCard key={tournament.id} tournament={tournament} onSelect={handleTournamentSelect} />)}
                      </div>
                    </div>}

                  {/* Past Tournaments - Collapsible */}
                  {pastTournaments.length > 0 && <div className="border-t pt-8">
                      <details className="group">
                        <summary className="cursor-pointer mb-4 flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-muted transition-colors">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground">
                              Past Tournaments ({pastTournaments.length})
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
                          {pastTournaments.map(tournament => <TournamentCard key={tournament.id} tournament={tournament} onSelect={handleTournamentSelect} />)}
                        </div>
                      </details>
                    </div>}
                </div>}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our free football tournament bulletin board
            </p>
          </div>

          <div className="space-y-4">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                <h3 className="text-lg font-semibold">What is UK Youth Football?</h3>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                <p className="text-muted-foreground">
                  UK Youth Football is a completely free bulletin board platform for youth football tournaments across the United Kingdom. 
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
                <h3 className="text-lg font-semibold">Do you organize tournaments?</h3>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                <p className="text-muted-foreground">
                  <strong>No, we don't organize tournaments.</strong> We are purely a listing platform - a digital bulletin board. 
                  Independent tournament organizers, clubs, leagues, and associations use our platform to promote their events. 
                  All tournament organization, management, registration, and customer service is handled directly by the individual organizers.
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

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                <h3 className="text-lg font-semibold">Who can participate in tournaments?</h3>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                <p className="text-muted-foreground">
                  Our platform features tournaments for youth players of all levels and age groups across the UK. 
                  Participation requirements vary by tournament - some are open to all teams, others may have specific 
                  eligibility criteria set by the organizer. Always check the tournament details and contact the organizer 
                  directly for registration information and specific requirements.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                <h3 className="text-lg font-semibold">Are there any contracts or commitments?</h3>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                <p className="text-muted-foreground">
                  <strong>No contracts, no commitments.</strong> Organizers can list and remove tournaments at any time. 
                  Teams can browse and contact organizers without any obligations. Our platform is designed to be flexible 
                  and user-friendly, with no long-term commitments required from anyone.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                <h3 className="text-lg font-semibold">How do I contact tournament organizers?</h3>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                <p className="text-muted-foreground">
                  Each tournament listing includes the organizer's contact information. You can reach out to them directly 
                  via the provided email, phone number, or website links. All registration, questions about the tournament, 
                  and customer service should be handled directly with the tournament organizer.
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left">
                <h3 className="text-lg font-semibold">What if I have issues with a tournament?</h3>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                <p className="text-muted-foreground">
                  Since we're a listing platform, all tournament-related issues should be resolved directly with the organizer. 
                  However, if you encounter any problems with our website or have concerns about a listing, please contact us 
                  and we'll do our best to help. We maintain quality standards for listings on our platform.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* FAQ Schema Markup for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is UK Youth Football?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "UK Youth Football is a completely free bulletin board platform for youth football tournaments across the United Kingdom. We connect tournament organizers with teams, players, and families looking for competitive opportunities."
                }
              },
              {
                "@type": "Question",
                "name": "Do you charge any fees?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, never. Our platform is completely free for both tournament organizers and teams. There are no listing fees, no commission charges, no subscription costs, and no hidden charges."
                }
              },
              {
                "@type": "Question",
                "name": "Do you organize tournaments?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, we don't organize tournaments. We are purely a listing platform - a digital bulletin board. Independent tournament organizers, clubs, leagues, and associations use our platform to promote their events."
                }
              },
              {
                "@type": "Question",
                "name": "How can organizers list their tournaments?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Tournament organizers can create a free account and add their events through our simple online form. You can include all the important details like dates, location, age groups, team format, entry fees, contact information, and registration deadlines."
                }
              },
              {
                "@type": "Question",
                "name": "Who can participate in tournaments?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our platform features tournaments for youth players of all levels and age groups across the UK. Participation requirements vary by tournament - some are open to all teams, others may have specific eligibility criteria set by the organizer."
                }
              },
              {
                "@type": "Question",
                "name": "Are there any contracts or commitments?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No contracts, no commitments. Organizers can list and remove tournaments at any time. Teams can browse and contact organizers without any obligations."
                }
              }
            ]
          })}
        </script>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">UK Youth Football</h3>
              <p className="text-primary-foreground/80 mb-4">
                Connecting young football talent with tournaments, leagues, and camps across the United Kingdom. 
                From grassroots to elite level competitions.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                  About Us
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                  <Link to="/faq">FAQ</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Contact
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Help
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Major Cities</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><Link to="/tournaments/london" className="hover:text-primary-foreground">London Tournaments</Link></li>
                <li><Link to="/tournaments/manchester" className="hover:text-primary-foreground">Manchester Tournaments</Link></li>
                <li><Link to="/tournaments/birmingham" className="hover:text-primary-foreground">Birmingham Tournaments</Link></li>
                <li><Link to="/tournaments/liverpool" className="hover:text-primary-foreground">Liverpool Tournaments</Link></li>
                <li><Link to="/tournaments/leeds" className="hover:text-primary-foreground">Leeds Tournaments</Link></li>
                <li><Link to="/tournaments/glasgow" className="hover:text-primary-foreground">Glasgow Tournaments</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">More Cities</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><Link to="/tournaments/newcastle-upon-tyne" className="hover:text-primary-foreground">Newcastle Tournaments</Link></li>
                <li><Link to="/tournaments/sheffield" className="hover:text-primary-foreground">Sheffield Tournaments</Link></li>
                <li><Link to="/tournaments/bristol" className="hover:text-primary-foreground">Bristol Tournaments</Link></li>
                <li><Link to="/tournaments/nottingham" className="hover:text-primary-foreground">Nottingham Tournaments</Link></li>
                <li><Link to="/tournaments/leicester" className="hover:text-primary-foreground">Leicester Tournaments</Link></li>
                <li><Link to="/tournaments/brighton" className="hover:text-primary-foreground">Brighton Tournaments</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">For Organizers</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Add Tournament</li>
                <li>Manage Events</li>
                <li>League Admin</li>
                <li>Analytics</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            <p>© 2024 UK Youth Football Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;