import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { useRegionStats } from '@/hooks/useRegionStats';
import { UK_CITIES } from '@/data/cities';

const regions = [
  {
    name: 'England',
    slug: 'england',
    description: 'The birthplace of modern football, England offers the most diverse range of youth tournaments across bustling cities and historic towns.',
    cities: UK_CITIES.filter(city => 
      !['Scotland', 'Wales', 'Northern Ireland'].includes(city.region)
    ).map(city => ({
      name: city.displayName,
      slug: city.slug,
    }))
  },
  {
    name: 'Scotland',
    slug: 'scotland',
    description: 'Experience the passion of Scottish football through competitive tournaments in stunning landscapes from the Highlands to the Lowlands.',
    cities: UK_CITIES.filter(city => city.region === 'Scotland').map(city => ({
      name: city.displayName,
      slug: city.slug,
    }))
  },
  {
    name: 'Wales',
    slug: 'wales',
    description: 'Welsh football tournaments combine Celtic pride with technical excellence, set against the beautiful backdrop of Welsh valleys and coastlines.',
    cities: UK_CITIES.filter(city => city.region === 'Wales').map(city => ({
      name: city.displayName,
      slug: city.slug,
    }))
  },
  {
    name: 'Northern Ireland',
    slug: 'northern-ireland',
    description: 'Northern Irish tournaments showcase the resilient spirit and community values that make football special in this proud region.',
    cities: UK_CITIES.filter(city => city.region === 'Northern Ireland').map(city => ({
      name: city.displayName,
      slug: city.slug,
    }))
  }
];

const Regions = () => {
  const { stats, loading, error } = useRegionStats();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Football Tournaments by Region | England, Scotland, Wales, Northern Ireland"
        description="Find youth football tournaments across all UK regions. Browse tournaments in England, Scotland, Wales, and Northern Ireland with comprehensive city-by-city listings."
        canonicalUrl="https://footballtournamentsuk.co.uk/regions"
      />

      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-foreground">Home</Link></li>
          <li>/</li>
          <li className="text-foreground">Regions</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tournament Regions Directory
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl">
            Explore youth football tournaments across the United Kingdom. From bustling English cities 
            to Scottish highlands, Welsh valleys, and Northern Ireland's passionate communities.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Overview Stats */}
        <section className="py-12 bg-surface">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {loading ? '...' : Object.values(stats).reduce((total, regionStats) => total + regionStats.total_active, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Tournaments</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {loading ? '...' : Object.values(stats).reduce((total, regionStats) => total + regionStats.cities_count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Cities with Tournaments</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">4</div>
                  <div className="text-sm text-muted-foreground">UK Regions</div>
                </CardContent>
              </Card>
            </div>

            {/* Regions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {regions.map((region) => {
                const regionStats = stats[region.slug] || { total_active: 0, upcoming: 0, cities_count: 0 };
                const hasActiveTournaments = regionStats.total_active > 0;
                
                return (
                  <Card key={region.slug} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl">{region.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {regionStats.cities_count} cities
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {regionStats.total_active} active
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {region.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {region.cities.map((city) => (
                          <Link 
                            key={city.slug}
                            to={`/city/${city.slug}`}
                            className="text-sm p-2 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                          >
                            <span>{city.name}</span>
                            <Badge variant="outline" className="text-xs">
                              View
                            </Badge>
                          </Link>
                        ))}
                      </div>
                      <Button 
                        asChild 
                        className="w-full"
                        variant={hasActiveTournaments ? "default" : "outline"}
                        disabled={!hasActiveTournaments}
                      >
                        <Link to={hasActiveTournaments ? `/tournaments?region=${region.slug}` : '#'}>
                          {hasActiveTournaments 
                            ? `View ${regionStats.total_active} Tournament${regionStats.total_active !== 1 ? 's' : ''}`
                            : 'No Active Tournaments'
                          }
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Regional Information */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">UK Football Tournament Landscape</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed mb-6">
                The United Kingdom boasts one of the world's most comprehensive youth football tournament networks. 
                Each region offers unique opportunities for player development, from the competitive metropolitan 
                leagues in <Link to="/city/london" className="text-primary hover:underline">London</Link> and 
                <Link to="/city/manchester" className="text-primary hover:underline">Manchester</Link> to the 
                community-focused festivals in smaller cities across <Link to="/city/glasgow" className="text-primary hover:underline">Scotland</Link> 
                and <Link to="/city/cardiff" className="text-primary hover:underline">Wales</Link>.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Regional Characteristics</h3>
              <p className="leading-relaxed mb-6">
                <strong>England</strong> leads in tournament quantity and variety, with major cities hosting both 
                grassroots festivals and elite competitions. <strong>Scotland</strong> emphasizes technical 
                development and community engagement, while <strong>Wales</strong> focuses on inclusive participation 
                and player welfare. <strong>Northern Ireland</strong> combines passionate local support with 
                high-quality coaching and facilities.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Finding Local Opportunities</h3>
              <p className="leading-relaxed mb-6">
                Each region maintains its own tournament calendar aligned with local school holidays and weather 
                patterns. Browse city-specific pages to discover tournaments that match your team's travel 
                capabilities and competitive aspirations. Many tournaments offer accommodation recommendations 
                and travel packages for visiting teams.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Access */}
        <section className="py-16 bg-surface">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Youth Tournaments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Age-specific tournaments designed for player development and enjoyment.
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/youth-tournaments">
                      Browse Youth Tournaments
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Tournament Formats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Compare different formats from 3v3 to 11v11 for all age groups.
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/tournament-formats">
                      View Formats Guide
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    All Tournaments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Search all available tournaments with advanced filtering options.
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/tournaments">
                      Search Tournaments
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Regions;