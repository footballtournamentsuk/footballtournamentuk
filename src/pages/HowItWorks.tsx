import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { 
  UserPlus, 
  FileText, 
  Globe, 
  MessageSquare, 
  Search, 
  MapPin, 
  Calendar, 
  Mail,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/hooks/useAnalyticsEvents';
import heroImage from '@/assets/how-it-works-hero.webp';
import ogImage from '@/assets/how-it-works-og.jpg';

const HowItWorks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Track page view
  useEffect(() => {
    trackEvent('howitworks_viewed');
  }, []);

  const handleCTAClick = (cta: string, path: string) => {
    trackEvent('howitworks_cta_click', { cta });
    navigate(path);
  };

  const handleAnchorClick = (section: string) => {
    trackEvent('howitworks_anchor_click', { section });
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const organiserSteps = [
    {
      icon: UserPlus,
      title: "Sign Up Free",
      description: "Create your account in under 2 minutes. No contracts, no fees, completely free forever."
    },
    {
      icon: FileText,
      title: "Add Tournament Details",
      description: "Fill in your tournament information: dates, formats (3v3, 5v5, 7v7, 9v9, 11v11), age groups, and location."
    },
    {
      icon: Globe,
      title: "Publish & Go Live",
      description: "Your tournament instantly appears across our platform, reaching thousands of teams and parents nationwide."
    },
    {
      icon: MessageSquare,
      title: "Manage Enquiries",
      description: "Receive direct enquiries from interested teams. Communicate directly with organisers through our platform."
    }
  ];

  const parentSteps = [
    {
      icon: Search,
      title: "Search by Location & Age",
      description: "Find youth football tournaments near you by city, age group, or tournament format across the UK."
    },
    {
      icon: MapPin,
      title: "View Details & Directions",
      description: "See full tournament information, venue details, and get directions to the location."
    },
    {
      icon: Calendar,
      title: "Save Favourites",
      description: "Bookmark tournaments you're interested in and track dates that work for your team's schedule."
    },
    {
      icon: Mail,
      title: "Contact Organisers",
      description: "Reach out directly to tournament organisers with questions or to register your team."
    }
  ];

  const faqs = [
    {
      question: "Is it really free to list tournaments?",
      answer: "Yes, absolutely. There are no fees, no contracts, and no hidden costs. We believe in supporting grassroots football by keeping our platform completely free for organisers."
    },
    {
      question: "How quickly will my tournament appear online?",
      answer: "Your tournament goes live immediately after you publish it. It will be searchable across our platform and visible to thousands of teams and parents right away."
    },
    {
      question: "Can I edit my tournament details after publishing?",
      answer: "Yes, you can update your tournament information at any time through your organiser profile. Changes appear instantly on the platform."
    },
    {
      question: "How do teams register for tournaments?",
      answer: "Teams contact you directly through our platform. You'll receive enquiries via email and can communicate with interested teams to manage registrations your way."
    },
    {
      question: "What tournament formats do you support?",
      answer: "We support all youth football formats: 3v3, 5v5, 7v7, 9v9, and 11v11 tournaments across all age groups from grassroots to elite level competitions."
    }
  ];

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://footballtournamentsuk.co.uk/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "How It Works",
            "item": "https://footballtournamentsuk.co.uk/how-it-works"
          }
        ]
      },
      {
        "@type": "HowTo",
        "name": "How to List Your Football Tournament",
        "description": "Step-by-step guide for organisers to list their youth football tournaments for free",
        "step": organiserSteps.map((step, index) => ({
          "@type": "HowToStep",
          "name": step.title,
          "text": step.description,
          "position": index + 1
        }))
      },
      {
        "@type": "HowTo",
        "name": "How to Find Football Tournaments",
        "description": "Step-by-step guide for parents and teams to find youth football tournaments",
        "step": parentSteps.map((step, index) => ({
          "@type": "HowToStep",
          "name": step.title,
          "text": step.description,
          "position": index + 1
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <>
      <SEO
        title="How Football Tournaments UK Works | Youth Football Across the UK"
        description="Learn how to find youth football tournaments or list your event free. Simple steps for organisers, parents & teams across the UK."
        canonicalUrl="/how-it-works"
        isHomePage={false}
      />
      
      {/* Custom meta tags for social sharing */}
      <meta property="og:image" content={`https://footballtournamentsuk.co.uk${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`https://footballtournamentsuk.co.uk${ogImage}`} />
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
      >
        Skip to content
      </a>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section 
          className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
          role="banner"
        >
          {/* Optimized hero image with proper loading attributes */}
          <img 
            src={heroImage}
            alt="Young football players in action on grass field representing UK youth football tournaments"
            className="absolute inset-0 w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              How Football Tournaments UK Works
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
              Find youth football near you — or list your tournament for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 md:mb-8 z-20 relative">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => handleCTAClick('organisers_list', user ? '/profile?tab=tournaments' : '/auth')}
                aria-label="List your football tournament for free"
              >
                List Free Tournament
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white text-white hover:bg-white hover:text-primary transition-all duration-200"
                onClick={() => handleCTAClick('find_tournaments', '/tournaments')}
                aria-label="Find football tournaments near you"
              >
                Find Tournaments
              </Button>
            </div>
            
            {/* Quick navigation to sections */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center text-sm z-20 relative">
              <button 
                onClick={() => handleAnchorClick('organisers')}
                className="text-white/90 hover:text-white underline decoration-dotted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:rounded px-2 py-1"
                aria-label="Jump to organiser information section"
              >
                For Organisers →
              </button>
              <button 
                onClick={() => handleAnchorClick('parents-teams')}
                className="text-white/90 hover:text-white underline decoration-dotted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:rounded px-2 py-1"
                aria-label="Jump to parents and teams information section"
              >
                For Parents & Teams →
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main id="main-content">
          {/* For Organisers Section */}
          <section id="organisers" className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">For Tournament Organisers</h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto">
                  List your youth football tournament and reach thousands of teams across the UK — completely free. Whether you're running <Link to="/tournaments?format=3v3" className="text-primary hover:underline">3v3 tournaments</Link>, <Link to="/tournaments?format=5v5" className="text-primary hover:underline">5v5 leagues</Link>, <Link to="/tournaments?format=7v7" className="text-primary hover:underline">7v7 competitions</Link>, or <Link to="/tournaments?format=11v11" className="text-primary hover:underline">11v11 matches</Link> across cities like <Link to="/tournaments/london" className="text-primary hover:underline">London</Link>, <Link to="/tournaments/manchester" className="text-primary hover:underline">Manchester</Link>, and <Link to="/tournaments/birmingham" className="text-primary hover:underline">Birmingham</Link>, we'll help you connect with teams nationwide.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {organiserSteps.map((step, index) => (
                  <Card key={index} className="text-center h-full">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <step.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-sm font-bold text-primary mb-2">Step {index + 1}</div>
                      <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button 
                  size="lg" 
                  onClick={() => handleCTAClick('organisers_list', user ? '/profile?tab=tournaments' : '/auth')}
                >
                  Start Listing Your Tournament
                </Button>
              </div>
            </div>
          </div>
        </section>

          {/* For Parents & Teams Section */}
          <section id="parents-teams" className="py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">For Parents & Teams</h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto">
                  Discover the perfect football tournaments for your young players across the UK. From <Link to="/tournaments?format=3v3" className="text-primary hover:underline">small-sided 3v3 games</Link> perfect for younger players, to competitive <Link to="/tournaments?format=9v9" className="text-primary hover:underline">9v9</Link> and <Link to="/tournaments?format=11v11" className="text-primary hover:underline">full 11v11 tournaments</Link>. Find opportunities in major cities like <Link to="/tournaments/liverpool" className="text-primary hover:underline">Liverpool</Link>, <Link to="/tournaments/leeds" className="text-primary hover:underline">Leeds</Link>, <Link to="/tournaments/glasgow" className="text-primary hover:underline">Glasgow</Link>, and <Link to="/tournaments/bristol" className="text-primary hover:underline">Bristol</Link>.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {parentSteps.map((step, index) => (
                  <Card key={index} className="text-center h-full">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <step.icon className="h-8 w-8 text-secondary" />
                      </div>
                      <div className="text-sm font-bold text-secondary mb-2">Step {index + 1}</div>
                      <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => handleCTAClick('find_tournaments', '/tournaments')}
                >
                  Browse Tournaments Now
                </Button>
              </div>
            </div>
          </div>
        </section>

          {/* Mini FAQ Section */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <HelpCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">Still have questions?</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleCTAClick('faq', '/faq')}
                >
                  View Full FAQ
                </Button>
              </div>
            </div>
          </div>
        </section>

          {/* Support Section */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Need Help?</h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 md:mb-8">
                Our team is here to support you every step of the way.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  size="lg"
                  onClick={() => handleCTAClick('contact_support', '/support')}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => handleCTAClick('faq', '/faq')}
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Browse FAQ
                </Button>
              </div>

              <p className="text-muted-foreground">
                Or email us directly at:{' '}
                <a 
                  href="mailto:info@footballtournamentsuk.co.uk"
                  className="text-primary hover:underline"
                  onClick={() => trackEvent('howitworks_cta_click', { cta: 'email_direct' })}
                >
                  info@footballtournamentsuk.co.uk
                </a>
              </p>
            </div>
          </div>
        </section>

          {/* Internal Linking Section */}
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 md:mb-12">Popular Tournament Locations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { name: 'London', slug: 'london' },
                  { name: 'Manchester', slug: 'manchester' },
                  { name: 'Birmingham', slug: 'birmingham' },
                  { name: 'Liverpool', slug: 'liverpool' },
                  { name: 'Leeds', slug: 'leeds' },
                  { name: 'Glasgow', slug: 'glasgow' },
                  { name: 'Newcastle', slug: 'newcastle-upon-tyne' },
                  { name: 'Bristol', slug: 'bristol' }
                ].map((city) => (
                  <Link 
                    key={city.slug}
                    to={`/tournaments/${city.slug}`}
                    className="block p-3 md:p-4 bg-card hover:bg-accent rounded-lg text-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`View football tournaments in ${city.name}`}
                  >
                    <span className="font-medium text-sm sm:text-base">{city.name} Tournaments</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        </main>
      </div>
    </>
  );
};

export default HowItWorks;