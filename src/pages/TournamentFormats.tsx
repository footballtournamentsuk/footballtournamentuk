import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

const TournamentFormats = () => {
  const formats = [
    {
      format: '3v3',
      players: '3 vs 3',
      ageGroups: 'U6-U8',
      duration: '10-15 min matches',
      description: 'Perfect introduction to competitive football for the youngest players',
      benefits: ['More touches per player', 'Builds confidence', 'Fun-focused environment'],
      searchUrl: '/tournaments?formats=3v3'
    },
    {
      format: '5v5',
      players: '5 vs 5',
      ageGroups: 'U9-U10',
      duration: '15-20 min matches',
      description: 'Ideal format for developing technical skills and game understanding',
      benefits: ['Enhanced ball control', 'Quick decision making', 'Team coordination'],
      searchUrl: '/tournaments?formats=5v5'
    },
    {
      format: '7v7',
      players: '7 vs 7',
      ageGroups: 'U11-U12',
      duration: '20-25 min halves',
      description: 'Bridge between small-sided and full football with tactical development',
      benefits: ['Positional awareness', 'Tactical understanding', 'Role specialization'],
      searchUrl: '/tournaments?formats=7v7'
    },
    {
      format: '9v9',
      players: '9 vs 9',
      ageGroups: 'U13-U14',
      duration: '25-30 min halves',
      description: 'Advanced tactical play with increased field coverage and strategy',
      benefits: ['Complex tactics', 'Stamina building', 'Advanced positioning'],
      searchUrl: '/tournaments?formats=9v9'
    },
    {
      format: '11v11',
      players: '11 vs 11',
      ageGroups: 'U15+',
      duration: '35-45 min halves',
      description: 'Full-scale football matching professional game conditions',
      benefits: ['Complete game experience', 'Physical development', 'Adult preparation'],
      searchUrl: '/tournaments?formats=11v11'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Football Tournament Formats | 3v3, 5v5, 7v7, 9v9, 11v11"
        description="Complete guide to youth football tournament formats from 3v3 to 11v11. Learn about age groups, match durations, and benefits of each format for player development."
        canonicalUrl="https://footballtournamentsuk.co.uk/tournament-formats"
      />

      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-foreground">Home</Link></li>
          <li>/</li>
          <li className="text-foreground">Tournament Formats</li>
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
            Tournament Formats Guide
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl">
            Discover the different tournament formats available for youth football teams. 
            From 3v3 festivals to full 11v11 competitions, find the perfect format for your players' development.
          </p>
        </div>
      </header>

      {/* Format Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {formats.map((format) => (
              <Card key={format.format} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{format.format}</span>
                    <Badge variant="outline" className="text-sm">
                      {format.ageGroups}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{format.players}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{format.duration}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{format.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-1">
                      {format.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full" asChild>
                    <Link to={format.searchUrl}>
                      Find {format.format} Tournaments
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Format Comparison */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Choosing the Right Format</h2>
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed mb-6">
                The tournament format significantly impacts player development and enjoyment. Smaller formats like 
                <Link to="/tournaments?formats=3v3" className="text-primary hover:underline mx-1">3v3</Link> and 
                <Link to="/tournaments?formats=5v5" className="text-primary hover:underline mx-1">5v5</Link> 
                provide more ball touches and encourage creativity, while larger formats like 
                <Link to="/tournaments?formats=9v9" className="text-primary hover:underline mx-1">9v9</Link> and 
                <Link to="/tournaments?formats=11v11" className="text-primary hover:underline mx-1">11v11</Link> 
                focus on tactical awareness and positional play.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Age-Appropriate Development</h3>
              <p className="leading-relaxed mb-6">
                Each format is carefully matched to age groups to ensure optimal learning. Younger players benefit 
                from increased involvement in smaller formats, while older players can handle the complexity and 
                physical demands of full-scale football. This progression system helps develop well-rounded players 
                who understand both individual skills and team dynamics.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Tournament Selection Tips</h3>
              <p className="leading-relaxed mb-6">
                When choosing tournaments for your team, consider your players' experience level, development goals, 
                and physical readiness. <Link to="/youth-tournaments" className="text-primary hover:underline">Youth tournaments</Link> 
                often feature multiple formats in one event, allowing players to experience different styles of play 
                and find their preferred competitive environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Find Tournaments by Format</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to enter your team in a tournament? Browse competitions by format to find the perfect 
            match for your players' skill level and development stage.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {formats.map((format) => (
              <Button key={format.format} variant="outline" asChild>
                <Link to={format.searchUrl}>
                  {format.format} Tournaments
                </Link>
              </Button>
            ))}
          </div>
          <Button size="lg" asChild>
            <Link to="/tournaments">
              Browse All Tournaments
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default TournamentFormats;