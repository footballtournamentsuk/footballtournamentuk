import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

export default function AffiliateDisclosure() {
  return (
    <>
      <SEO 
        title="Affiliate Disclosure | Football Tournaments UK"
        description="Information about affiliate partnerships and compensation that may be earned through links on Football Tournaments UK."
        canonicalUrl="/affiliate-disclosure"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Affiliate Disclosure</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Transparency in Partnerships</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="lead">
                  Football Tournaments UK believes in transparency regarding any financial 
                  relationships that may influence our content or recommendations.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Affiliate Relationships</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>What Are Affiliate Links?</h3>
                  <p>
                    Affiliate links are special tracking links that may provide us with a commission 
                    if you make a purchase or sign up for a service after clicking them. This comes 
                    at no additional cost to you.
                  </p>

                  <h3>Current Status</h3>
                  <p>
                    As of January 2025, Football Tournaments UK primarily operates as a free 
                    listing service without affiliate partnerships. However, we may develop 
                    affiliate relationships in the future with:
                  </p>
                  <ul>
                    <li>Sports equipment retailers</li>
                    <li>Tournament management software providers</li>
                    <li>Training and coaching services</li>
                    <li>Sports insurance providers</li>
                    <li>Travel and accommodation services</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. How We Identify Affiliate Content</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Clear Labelling</h3>
                  <p>
                    When we include affiliate links, they will be clearly identified with:
                  </p>
                  <ul>
                    <li>The phrase "affiliate link" or "sponsored link"</li>
                    <li>An asterisk (*) with explanation</li>
                    <li>Visual indicators such as special styling</li>
                    <li>Disclosure statements at the beginning of relevant content</li>
                  </ul>

                  <h3>Example Disclosures</h3>
                  <p>
                    You may see disclosures such as:
                  </p>
                  <div className="bg-muted p-4 rounded">
                    <p>
                      "This post contains affiliate links. We may earn a commission 
                      at no extra cost to you if you make a purchase through these links."
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Our Editorial Independence</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Content Integrity</h3>
                  <p>
                    Our editorial content is never influenced by affiliate relationships. We maintain 
                    strict separation between:
                  </p>
                  <ul>
                    <li>Editorial tournament listings and reviews</li>
                    <li>Commercial partnerships and affiliate content</li>
                    <li>User-generated content and promotional material</li>
                  </ul>

                  <h3>Honest Recommendations</h3>
                  <p>
                    When we recommend products or services, whether affiliated or not, our 
                    recommendations are based on:
                  </p>
                  <ul>
                    <li>Genuine utility for our users</li>
                    <li>Quality and reputation of the provider</li>
                    <li>Relevant experience or research</li>
                    <li>Community feedback and reviews</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Your Rights and Choices</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>No Obligation</h3>
                  <p>
                    You are never obligated to use affiliate links. You can:
                  </p>
                  <ul>
                    <li>Navigate directly to the provider's website</li>
                    <li>Search for alternative providers</li>
                    <li>Compare prices and terms independently</li>
                    <li>Choose not to make any purchase</li>
                  </ul>

                  <h3>Privacy Considerations</h3>
                  <p>
                    Affiliate links may track your clicks and purchases for commission purposes. 
                    This tracking is handled by third-party affiliate networks and subject to 
                    their privacy policies.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Types of Potential Partnerships</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Equipment and Gear</h3>
                  <p>
                    Links to football boots, training equipment, team kits, and sports gear retailers.
                  </p>

                  <h3>Services</h3>
                  <p>
                    Tournament management platforms, booking systems, insurance providers, 
                    and other services relevant to football tournaments.
                  </p>

                  <h3>Travel and Accommodation</h3>
                  <p>
                    Hotels, travel booking sites, and transportation services for tournament travel.
                  </p>

                  <h3>Training and Development</h3>
                  <p>
                    Coaching courses, referee training, and football development programs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Compliance and Standards</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Legal Compliance</h3>
                  <p>
                    Our affiliate disclosures comply with:
                  </p>
                  <ul>
                    <li>UK advertising standards and consumer protection laws</li>
                    <li>ASA (Advertising Standards Authority) guidelines</li>
                    <li>CMA (Competition and Markets Authority) requirements</li>
                    <li>GDPR privacy regulations</li>
                  </ul>

                  <h3>Industry Best Practices</h3>
                  <p>
                    We follow industry standards for affiliate marketing disclosure and 
                    maintain transparency in all commercial relationships.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Questions About Affiliate Content</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    If you have questions about our affiliate relationships or specific links:
                  </p>
                  <p>
                    <strong>Email:</strong> info@footballtournamentsuk.co.uk<br />
                    <strong>Subject:</strong> Affiliate Inquiry
                  </p>
                  
                  <p>
                    We're happy to clarify any affiliate relationships and explain how they 
                    may affect our content.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Updates to This Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    This affiliate disclosure may be updated as we develop new partnerships. 
                    Changes will be reflected with an updated date and notification of significant 
                    changes.
                  </p>
                  
                  <p>
                    <strong>Last Updated:</strong> January 2025
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}