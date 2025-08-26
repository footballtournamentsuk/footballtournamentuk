import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

export default function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Use | Football Tournaments UK"
        description="Terms and conditions for using Football Tournaments UK. Our terms of service, disclaimers, and user responsibilities."
        canonicalUrl="/terms"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Last Updated: January 2025</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="lead">
                  These Terms of Use govern your access to and use of Football Tournaments UK 
                  ("we", "our", "us"). By using our service, you agree to these terms.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Service Description</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Football Tournaments UK is a platform that lists football tournaments and events 
                    across the United Kingdom. We provide information about tournaments but are not 
                    organisers of these events unless explicitly stated.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Use of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <ul>
                    <li>You must be at least 13 years old to use our service</li>
                    <li>You agree to provide accurate information when creating listings</li>
                    <li>You will not use our service for unlawful purposes</li>
                    <li>You will not attempt to disrupt or harm our service</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Content and Accuracy</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    <strong>Information is provided "as-is".</strong> We make no warranties about the 
                    accuracy, completeness, or timeliness of tournament information. Users should verify 
                    all details directly with tournament organisers.
                  </p>
                  <p>
                    Tournament dates, prices, and details may change without notice. We are not responsible 
                    for cancelled events, schedule changes, or pricing variations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    To the fullest extent permitted by law, Football Tournaments UK shall not be liable 
                    for any indirect, incidental, special, consequential, or punitive damages resulting 
                    from your use of our service.
                  </p>
                  <p>
                    Our total liability for any claims shall not exceed £100 or the amount you paid us 
                    in the 12 months preceding the claim, whichever is less.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Third-Party Services</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Our platform may contain links to third-party websites or services. We are not 
                    responsible for the content, privacy policies, or practices of third parties.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Governing Law</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    These Terms are governed by the laws of England and Wales. Any disputes shall be 
                    subject to the exclusive jurisdiction of the courts of England and Wales.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    We may update these Terms from time to time. Changes will be posted on this page 
                    with an updated "Last Updated" date. Continued use of our service constitutes 
                    acceptance of any changes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    For questions about these Terms, please contact us at:
                  </p>
                  <p>
                    <strong>Email:</strong> info@footballtournamentsuk.co.uk
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