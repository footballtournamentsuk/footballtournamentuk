import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone, Handshake, Users, Heart, Mail } from 'lucide-react';
import { UnifiedSEO } from '@/components/UnifiedSEO';
import { SupportModal } from '@/components/SupportModal';
import { trackEvent } from '@/hooks/useAnalyticsEvents';
import heroBackground from '@/assets/hero-football.jpg';
const Support = () => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleContactSupport = () => {
    trackEvent('support_contact_click', { source: 'support_page' });
    setIsSupportModalOpen(true);
  };

  return <div className="min-h-screen bg-background">
      <UnifiedSEO 
        title="Support Us - Football Tournaments UK" 
        description="Support grassroots football in the UK. Help us connect teams, players, and organizers across the country with our 100% free platform." 
        canonicalUrl="/support"
        keywords="support grassroots football, sponsor football tournaments, volunteer football UK, football community support"
      />
      
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat py-32 px-4 flex items-center justify-center" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(${heroBackground})`
    }}>
        <div className="container mx-auto text-center text-white max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Fuel the Passion. Grow the Game.
          </h1>
          <p className="text-xl md:text-2xl mb-4 font-medium opacity-90">
            Your support keeps grassroots football alive.
          </p>
          <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
            We connect teams, players, and organizers across the UK — 100% free. Together, we can make football opportunities accessible for everyone.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Introduction */}
          <div className="text-center mb-16">
            <div className="bg-primary/10 p-8 rounded-2xl border border-primary/20">
              <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                At Football Tournaments UK, our mission is simple — unite the football community, inspire young athletes, and promote a healthy lifestyle through the beautiful game.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We never charge fees or require payments. Our platform is open to all, but if you believe in our vision and want to help us grow, we'd love to hear from you.
              </p>
            </div>
          </div>

          {/* Ways to Help */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
              Ways You Can Help
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
                    <Megaphone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Share Our Platform</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Help us reach more football communities across the UK. Share our platform with teams, organizers, and players who could benefit from our free services.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
                    <Handshake className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Become a Sponsor</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Support grassroots events and help us expand our reach. Partner with us to promote youth football and community sports across the nation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Volunteer Your Skills</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Have skills in web development, marketing, or community outreach? Join our team of volunteers and help us build a stronger platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-12 rounded-2xl border border-primary/20">
            <Mail className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4 text-foreground">
              Want to Get Involved?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you want to sponsor events, volunteer your time, or simply spread the word about our platform, we'd love to hear from you.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3"
              onClick={handleContactSupport}
              aria-label="Open contact support form"
            >
              Contact Us to Support
            </Button>
          </div>

          {/* Free Platform Emphasis */}
          <div className="mt-16 text-center">
            <div className="bg-secondary/50 p-8 rounded-2xl border border-secondary">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Always 100% Free
              </h3>
              <p className="text-lg leading-relaxed max-w-3xl mx-auto text-slate-50">
                Our platform will always remain free for organizers, teams, and players. We believe football opportunities should be accessible to everyone, regardless of their financial situation. Your support helps us maintain and improve our services while keeping them completely free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>;
};
export default Support;