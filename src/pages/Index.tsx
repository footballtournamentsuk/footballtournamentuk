import React, { useState, useMemo } from 'react';
import Hero from '@/components/Hero';
import Map from '@/components/Map';
import TournamentFilters from '@/components/TournamentFilters';
import TournamentCard from '@/components/TournamentCard';
import { mockTournaments } from '@/data/mockTournaments';
import { Tournament, TournamentFilters as Filters } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter } from 'lucide-react';

const Index = () => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter tournaments based on active filters and search query
  const filteredTournaments = useMemo(() => {
    let filtered = mockTournaments;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(query) ||
        tournament.description?.toLowerCase().includes(query) ||
        tournament.location.name.toLowerCase().includes(query) ||
        tournament.location.region.toLowerCase().includes(query) ||
        tournament.league?.name.toLowerCase().includes(query)
      );
    }

    // Apply filters
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
    
    if (filters.regions?.length) {
      filtered = filtered.filter(t => filters.regions!.includes(t.location.region));
    }
    
    if (filters.status?.length) {
      filtered = filtered.filter(t => filters.status!.includes(t.status));
    }

    return filtered;
  }, [mockTournaments, filters, searchQuery]);

  const handleTournamentSelect = (tournament: Tournament | null) => {
    setSelectedTournament(tournament);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  ) || searchQuery.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

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
          
          <Map 
            tournaments={filteredTournaments}
            selectedTournament={selectedTournament}
            onTournamentSelect={handleTournamentSelect}
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
                {/* Search and Add Tournament */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Find Tournaments</h2>
                    <Button variant="default" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tournament
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search tournaments, locations, leagues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
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
              </div>
            </div>

            {/* Main Content - Tournament Cards */}
            <div className="lg:w-2/3">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {filteredTournaments.length} Tournament{filteredTournaments.length !== 1 ? 's' : ''} Found
                  </h3>
                  {hasActiveFilters && (
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

              {filteredTournaments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚽</div>
                  <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTournaments.map(tournament => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onSelect={handleTournamentSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Contact
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Help
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">For Teams</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Find Tournaments</li>
                <li>League Registration</li>
                <li>Holiday Camps</li>
                <li>Team Management</li>
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
    </div>
  );
};

export default Index;
