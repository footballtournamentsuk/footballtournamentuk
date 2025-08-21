import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowLeft, Mail, Phone } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { trackEvent } from '@/hooks/useAnalyticsEvents';

const FAQ = () => {
  const navigate = useNavigate();

  const handleContactSupport = () => {
    trackEvent('faq_contact_support_click', {
      source: 'faq_page',
      timestamp: Date.now()
    });
    navigate('/support');
  };

  const faqData = [
    {
      question: "What is UK Youth Football?",
      answer: "UK Youth Football is a completely free bulletin board platform for youth football tournaments across the United Kingdom. We connect tournament organizers with teams, players, and families looking for competitive opportunities. Think of us as a digital noticeboard where organizers can list their events and teams can discover tournaments in their area."
    },
    {
      question: "Do you charge any fees?",
      answer: "No, never. Our platform is completely free for both tournament organizers and teams. There are no listing fees, no commission charges, no subscription costs, and no hidden charges. We believe youth football should be accessible to everyone, and we're committed to keeping our service free forever."
    },
    {
      question: "Do you organize tournaments?",
      answer: "No, we don't organize tournaments. We are purely a listing platform - a digital bulletin board. Independent tournament organizers, clubs, leagues, and associations use our platform to promote their events. All tournament organization, management, registration, and customer service is handled directly by the individual organizers."
    },
    {
      question: "How can organizers list their tournaments?",
      answer: "Tournament organizers can create a free account and add their events through our simple online form. You can include all the important details like dates, location, age groups, team format, entry fees, contact information, and registration deadlines. Once submitted, tournaments are immediately visible to teams and families searching our platform."
    },
    {
      question: "Who can participate in tournaments?",
      answer: "Our platform features tournaments for youth players of all levels and age groups across the UK. Participation requirements vary by tournament - some are open to all teams, others may have specific eligibility criteria set by the organizer. Always check the tournament details and contact the organizer directly for registration information and specific requirements."
    },
    {
      question: "Are there any contracts or commitments?",
      answer: "No contracts, no commitments. Organizers can list and remove tournaments at any time. Teams can browse and contact organizers without any obligations. Our platform is designed to be flexible and user-friendly, with no long-term commitments required from anyone."
    },
    {
      question: "How do I contact tournament organizers?",
      answer: "Each tournament listing includes the organizer's contact information. You can reach out to them directly via the provided email, phone number, or website links. All registration, questions about the tournament, and customer service should be handled directly with the tournament organizer."
    },
    {
      question: "What if I have issues with a tournament?",
      answer: "Since we're a listing platform, all tournament-related issues should be resolved directly with the organizer. However, if you encounter any problems with our website or have concerns about a listing, please contact us and we'll do our best to help. We maintain quality standards for listings on our platform."
    },
    {
      question: "How do I search for tournaments in my area?",
      answer: "Use our search and filter tools on the homepage to find tournaments by location, age group, format, and dates. You can search by city, region, or postcode to find events near you. Our interactive map also shows all upcoming tournaments with their exact locations."
    },
    {
      question: "Can I get notifications about new tournaments?",
      answer: "Currently, we recommend bookmarking our site and checking back regularly for new tournament listings. Tournament organizers typically post events several weeks or months in advance, so regular visits will help you stay updated on new opportunities in your area."
    },
    {
      question: "What information is included in tournament listings?",
      answer: "Tournament listings include comprehensive details such as dates and times, venue location with maps, age groups and team formats, entry fees and deadlines, contact information, rules and regulations, and any special requirements or eligibility criteria."
    },
    {
      question: "How can I report inappropriate content or fake listings?",
      answer: "If you encounter any inappropriate content, suspicious listings, or have concerns about a tournament organizer, please contact us immediately. We take the safety and integrity of our platform seriously and will investigate all reports promptly."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="FAQ - Frequently Asked Questions | UK Youth Football"
        description="Get answers to common questions about our free youth football tournament bulletin board. Learn about our platform, how to list tournaments, participation requirements, and more."
      />

      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-primary-foreground/80 mt-4 max-w-2xl">
            Everything you need to know about our free football tournament bulletin board platform
          </p>
        </div>
      </header>

      {/* Quick Navigation */}
      <section className="py-8 bg-surface">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Quick Navigation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {faqData.slice(0, 6).map((faq, index) => (
                  <a 
                    key={index}
                    href={`#faq-${index}`}
                    className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors block"
                  >
                    {faq.question}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger 
                  id={`faq-${index}`}
                  className="flex items-center justify-between w-full p-6 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left group"
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6 bg-background border-x border-b border-border rounded-b-lg">
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? We're here to help! 
            Contact us directly and we'll get back to you as soon as possible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="default" 
              size="lg" 
              className="flex items-center gap-2"
              onClick={handleContactSupport}
              aria-label="Contact our support team"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/">
                View All Tournaments
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;