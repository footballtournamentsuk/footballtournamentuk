import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { Users, Target, Heart, Globe, CheckCircle, Star, Trophy, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/about-hero-bg.jpg';
import communityImage from '@/assets/community-training.jpg';
import stadiumImage from '@/assets/stadium-view.jpg';

const About = () => {
  const stats = [
    { number: "50+", label: "Upcoming Tournaments" },
    { number: "1,000+", label: "Players Connected" },
    { number: "100%", label: "Free to Use" },
    { number: "UK-Wide", label: "Coverage" }
  ];

  const values = [
    { icon: Trophy, title: "Fair Play & Sportsmanship", description: "Promoting integrity and respect in every match" },
    { icon: Users, title: "Community & Inclusion", description: "Welcoming players from all backgrounds and abilities" },
    { icon: Target, title: "Dedication & Growth", description: "Supporting continuous improvement and development" },
    { icon: Globe, title: "Respect for the Game", description: "Honoring football's traditions and values" }
  ];

  const benefits = [
    { icon: CheckCircle, title: "100% Free", description: "No fees, no hidden costs, no contracts" },
    { icon: Star, title: "Easy to Use", description: "Post your tournament or find one in minutes" },
    { icon: MapPin, title: "Nationwide Reach", description: "From London to Manchester, Liverpool to Leeds" },
    { icon: Heart, title: "For Everyone", description: "Open to organizers, coaches, teams, and players of all ages" }
  ];

  const testimonials = [
    {
      quote: "This platform made organizing our youth tournament so much easier. The reach we got was incredible!",
      author: "Sarah Johnson",
      role: "Tournament Organizer, Manchester United Youth"
    },
    {
      quote: "Found the perfect tournament for our team's development. The variety of events is amazing.",
      author: "David Williams",
      role: "Coach, Liverpool FC Academy"
    },
    {
      quote: "As a parent, I love how easy it is to find local tournaments for my kids to participate in.",
      author: "Emma Thompson",
      role: "Parent & Football Enthusiast"
    }
  ];

  return (
    <>
      <SEO
        title="About Us - Football Tournaments UK | Connecting Teams, Inspiring Players"
        description="Learn about Football Tournaments UK - the UK's premier free platform for youth football tournaments. Connecting teams, inspiring players, and growing the game nationwide."
        canonicalUrl="/about"
        isHomePage={false}
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section 
          className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Connecting Teams.<br />
              Inspiring Players.<br />
              Growing the Game.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Your free UK football tournament hub — empowering organizers, inspiring players, and building communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/">Find Tournaments</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
                Add Your Event
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Who We Are</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg mb-6 leading-relaxed">
                    At Football Tournaments UK, we believe in the power of football to inspire, connect, and change lives.
                  </p>
                  <p className="text-lg mb-6 leading-relaxed">
                    We are not event organizers — we are a free online bulletin board for football tournaments across the UK.
                  </p>
                  <p className="text-lg leading-relaxed font-medium text-primary">
                    Our mission: help organizers share their events and help players find new challenges and opportunities.
                  </p>
                </div>
                <div className="relative">
                  <img 
                    src={communityImage} 
                    alt="Community football training session with diverse young players"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Mission & Values</h2>
              
              {/* Mission */}
              <div className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-center">Our Mission</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="h-full">
                    <CardContent className="p-8">
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-lg">Promote grassroots and youth football in the UK</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-lg">Inspire players to achieve their full potential</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="h-full">
                    <CardContent className="p-8">
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-lg">Support healthy and active lifestyles</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-lg">Create opportunities for all ages and skill levels</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Values */}
              <div>
                <h3 className="text-2xl font-bold mb-8 text-center">Our Values</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {values.map((value, index) => (
                    <Card key={index} className="text-center h-full">
                      <CardContent className="p-6">
                        <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h4 className="font-bold mb-3">{value.title}</h4>
                        <p className="text-sm text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose Us?</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="h-full">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <benefit.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What People Say</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="h-full">
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <div className="flex text-primary mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                        <blockquote className="text-lg italic mb-4">
                          "{testimonial.quote}"
                        </blockquote>
                      </div>
                      <div className="border-t pt-4">
                        <div className="font-bold">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-20 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${stadiumImage})` }}
        >
          <div className="absolute inset-0 bg-primary/80" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Share Your Tournament?</h2>
              <p className="text-xl mb-8">
                Join hundreds of organizers who trust us to promote their events across the UK.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Add Your Event
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link to="/">Browse Tournaments</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;