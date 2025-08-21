import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Shield, MapPin, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

const YouthTournaments = () => {
  const ageGroups = [
    { age: 'U6-U8', description: 'Fun festivals and small-sided games', format: '3v3' },
    { age: 'U9-U10', description: '5v5 tournaments with shorter matches', format: '5v5' },
    { age: 'U11-U12', description: '7v7 competitive tournaments', format: '7v7' },
    { age: 'U13-U14', description: '9v9 development focused', format: '9v9' },
    { age: 'U15-U21', description: 'Full 11v11 competitive matches', format: '11v11' },
  ];

  const topCities = [
    { name: 'London', slug: 'london' },
    { name: 'Manchester', slug: 'manchester' },
    { name: 'Birmingham', slug: 'birmingham' },
    { name: 'Liverpool', slug: 'liverpool' },
    { name: 'Leeds', slug: 'leeds' },
    { name: 'Glasgow', slug: 'glasgow' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Youth Football Tournaments UK | Age Groups U6–U21"
        description="Find youth football tournaments across the UK for all age groups from U6 to U21. Safe, competitive environments with proper age-group divisions and qualified supervision."
        canonicalUrl="https://footballtournamentsuk.co.uk/youth-tournaments"
      />

      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-foreground">Home</Link></li>
          <li>/</li>
          <li className="text-foreground">Youth Tournaments</li>
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
            Youth Football Tournaments Across the UK
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl">
            Discover safe, competitive football tournaments designed specifically for young players. 
            From grassroots festivals to elite competitions, find the perfect tournament for your team.
          </p>
        </div>
      </header>

      {/* Age Groups Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Age Groups & Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ageGroups.map((group) => (
              <Card key={group.age} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{group.age}</span>
                    <Link to={`/tournaments?formats=${group.format.toLowerCase()}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {group.format}
                      </Badge>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{group.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/tournaments?formats=${group.format.toLowerCase()}`}>
                      Find {group.format} Tournaments
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What to Expect at Youth Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Safe Environment</h3>
              <p className="text-sm text-muted-foreground">
                All tournaments follow strict safeguarding protocols with qualified supervisors and proper insurance coverage.
              </p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Age-Appropriate</h3>
              <p className="text-sm text-muted-foreground">
                Players compete against others in their own age group with modified rules suitable for their development stage.
              </p>
            </div>
            <div className="text-center">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Fun & Competitive</h3>
              <p className="text-sm text-muted-foreground">
                Balance of enjoyment and competition, helping young players develop skills and confidence on the pitch.
              </p>
            </div>
            <div className="text-center">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Flexible Formats</h3>
              <p className="text-sm text-muted-foreground">
                Various tournament lengths from single-day festivals to weekend competitions to suit different schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              Youth football tournaments provide an excellent opportunity for young players to develop their skills, 
              build confidence, and experience competitive football in a supportive environment. Our platform connects 
              teams with high-quality tournaments across England, Scotland, and Wales, ensuring every young footballer 
              can find appropriate competition.
            </p>
            
            <h3 className="text-2xl font-bold mb-4">Safety & Development Focus</h3>
            <p className="leading-relaxed mb-6">
              All listed tournaments prioritise player safety and development over pure competition. Age-group divisions 
              ensure fair play, while qualified coaching and medical support provide peace of mind for parents and coaches. 
              Tournament formats are specifically designed to maximise playing time and learning opportunities for every participant.
            </p>
            
            <h3 className="text-2xl font-bold mb-4">Finding the Right Tournament</h3>
            <p className="leading-relaxed mb-6">
              Whether you're looking for a local festival to introduce young players to competitive football or seeking 
              elite-level tournaments for advanced development, our comprehensive listing system helps you find the perfect match. 
              Filter by <Link to="/tournament-formats" className="text-primary hover:underline">tournament format</Link>, 
              location, and date to discover opportunities that suit your team's needs and skill level.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Tournament Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topCities.map((city) => (
              <Button key={city.slug} variant="outline" asChild className="h-auto py-4">
                <Link to={`/city/${city.slug}`} className="flex flex-col items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{city.name}</span>
                </Link>
              </Button>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="default" size="lg" asChild>
              <Link to="/regions">
                View All Regions
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Next Tournament?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse hundreds of youth football tournaments across the UK. From grassroots festivals to competitive leagues, 
            find the perfect opportunity for your young players.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/tournaments">
                Browse All Tournaments
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default YouthTournaments;