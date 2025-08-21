import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PartnersCarousel from '@/components/PartnersCarousel';
import { SEO } from '@/components/SEO';
import { 
  Trophy, 
  Users, 
  MapPin, 
  Award, 
  Target, 
  Heart, 
  ExternalLink,
  CheckCircle,
  Star,
  TrendingUp 
} from 'lucide-react';

const Partners = () => {
  const handleBecomePartner = () => {
    const email = 'info@footballtournamentsuk.co.uk';
    const subject = 'Partnership Inquiry - Football Tournaments UK';
    const body = 'Hello,\n\nI am interested in discussing partnership opportunities with Football Tournaments UK.\n\nPlease contact me to arrange a discussion.\n\nBest regards,';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Try to open email client
    try {
      window.open(mailtoUrl, '_self');
    } catch (error) {
      // Fallback: copy email to clipboard and show alert
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          alert(`Email client not available. Email address copied to clipboard: ${email}`);
        }).catch(() => {
          alert(`Please contact us at: ${email}`);
        });
      } else {
        alert(`Please contact us at: ${email}`);
      }
    }
  };

  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Nationwide Reach",
      description: "Connect with clubs and players across England, Scotland, Wales, and Northern Ireland"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Youth Development Focus",
      description: "Support the next generation of football talent through grassroots initiatives"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Community Impact",
      description: "Make a meaningful difference in local communities and football development"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Brand Recognition",
      description: "Showcase your commitment to youth sports and community development"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Growing Network",
      description: "Join a rapidly expanding platform connecting thousands of players and clubs"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Social Responsibility",
      description: "Demonstrate your values through supporting grassroots football initiatives"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Young Players Reached" },
    { number: "500+", label: "Clubs Connected" },
    { number: "UK-Wide", label: "Coverage" },
    { number: "Growing", label: "Community Impact" }
  ];

  return (
    <>
      <SEO 
        title="Partners - Football Tournaments UK | Building the Future of Youth Football"
        description="Join Football Tournaments UK as a partner. Unite players, clubs, and communities across the UK. Create opportunities, inspire the next generation, and grow football together."
        canonicalUrl="/partners"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Partnership Opportunities
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Football Tournaments UK —{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Building the Future
                </span>{' '}
                of Youth & Grassroots Football
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Uniting players, clubs, and communities across England, Scotland, Wales, and Northern Ireland. 
                Create opportunities, inspire the next generation, and grow football together.
              </p>
              
              <div className="pt-4">
                <Button 
                  onClick={handleBecomePartner}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 text-lg gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5" />
                  Become a Partner
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card/50 border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Carousel */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <PartnersCarousel 
              showTitle={true} 
              showButton={false} 
              compact={false} 
            />
          </div>
        </section>

        {/* Why Partner With Us */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Partner With Us?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join a mission-driven platform that's transforming youth football across the UK. 
                Make a lasting impact while growing your brand.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/60 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        {benefit.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Creating Lasting Impact Together
                </h2>
                <p className="text-xl text-muted-foreground">
                  Our partnerships go beyond sponsorship — they create opportunities for young people to thrive
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Youth Development Programs</h3>
                      <p className="text-muted-foreground">Supporting coaching, training, and educational initiatives that help young players reach their potential.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Community Building</h3>
                      <p className="text-muted-foreground">Connecting clubs, families, and communities through the beautiful game across the UK.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Accessible Football</h3>
                      <p className="text-muted-foreground">Making football accessible to all young people, regardless of background or location.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-2xl p-8 shadow-lg">
                  <div className="text-center space-y-4">
                    <Star className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="text-2xl font-bold">Trusted Platform</h3>
                    <p className="text-muted-foreground">
                      Recognized by clubs, academies, and government organizations as a reliable partner in youth football development.
                    </p>
                    <div className="pt-4">
                      <Badge variant="secondary" className="text-sm">
                        Established & Growing
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join us in building the future of youth football. Together, we can create opportunities, 
                inspire young talent, and strengthen communities across the UK.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleBecomePartner}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 text-lg gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5" />
                  Start Partnership Discussion
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                  className="px-8 py-4 text-lg"
                >
                  <a href="mailto:info@footballtournamentsuk.co.uk?subject=Partnership Information Request">
                    Request More Information
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Partners;