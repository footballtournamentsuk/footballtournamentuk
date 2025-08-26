import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

export default function EditorialPolicy() {
  return (
    <>
      <SEO 
        title="Editorial Policy | Football Tournaments UK"
        description="Our editorial standards, content verification process, and commitment to accuracy in football tournament reporting."
        canonicalUrl="/editorial-policy"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Editorial Policy</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Our Commitment to Quality</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="lead">
                  Football Tournaments UK is committed to providing accurate, timely, and useful 
                  information about football tournaments across the UK. This policy outlines our 
                  editorial standards and practices.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Content Standards</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Accuracy</h3>
                  <p>
                    We strive to ensure all tournament information is accurate at the time of publication. 
                    This includes dates, venues, pricing, and contact details.
                  </p>
                  
                  <h3>Impartiality</h3>
                  <p>
                    Our content aims to be impartial and balanced. We do not favour specific tournaments 
                    or organisers unless clearly marked as sponsored content.
                  </p>
                  
                  <h3>Clarity</h3>
                  <p>
                    Information is presented in clear, accessible language that serves both players 
                    and tournament organisers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Verification Process</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Source Verification</h3>
                  <ul>
                    <li>Direct communication with tournament organisers</li>
                    <li>Cross-referencing with official tournament websites</li>
                    <li>Verification of venue details and capacity</li>
                    <li>Confirmation of pricing and registration processes</li>
                  </ul>
                  
                  <h3>Ongoing Monitoring</h3>
                  <p>
                    We regularly review listed tournaments to ensure information remains current. 
                    However, users should always verify details directly with organisers before 
                    making commitments.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Updates and Corrections</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Regular Updates</h3>
                  <p>
                    Tournament listings are updated as new information becomes available. 
                    Major changes are reflected promptly when brought to our attention.
                  </p>
                  
                  <h3>Correction Policy</h3>
                  <p>
                    When errors are identified, we correct them promptly and transparently. 
                    Significant corrections may include a note about the change.
                  </p>
                  
                  <h3>User Feedback</h3>
                  <p>
                    We welcome feedback from users about accuracy or updates needed. 
                    Contact us at info@footballtournamentsuk.co.uk with corrections.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Content Sources</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Primary Sources</h3>
                  <ul>
                    <li>Tournament organisers and official communications</li>
                    <li>Venue management and facility information</li>
                    <li>Football associations and governing bodies</li>
                  </ul>
                  
                  <h3>Secondary Sources</h3>
                  <ul>
                    <li>Reputable sports news outlets</li>
                    <li>Official social media accounts</li>
                    <li>Published tournament regulations and guidelines</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Sponsored Content</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Any sponsored or promotional content is clearly marked as such. We maintain 
                    editorial independence and do not allow sponsors to influence our content standards.
                  </p>
                  
                  <p>
                    Featured tournaments or promoted listings are identified with appropriate labelling.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. User-Generated Content</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Reviews and user comments are moderated to ensure they meet our community standards. 
                    We reserve the right to remove content that is:
                  </p>
                  <ul>
                    <li>Abusive, threatening, or discriminatory</li>
                    <li>Contains false or misleading information</li>
                    <li>Violates privacy or contains personal information</li>
                    <li>Is commercial spam or unrelated to tournaments</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Editorial Contact</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    For editorial inquiries, corrections, or suggestions:
                  </p>
                  <p>
                    <strong>Email:</strong> info@footballtournamentsuk.co.uk<br />
                    <strong>Subject:</strong> Editorial - [Your Topic]
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