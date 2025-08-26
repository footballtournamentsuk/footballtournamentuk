import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

export default function NoticeAndTakedown() {
  return (
    <>
      <SEO 
        title="Notice & Takedown Policy | Football Tournaments UK"
        description="Our DMCA and notice procedures for copyright infringement, content disputes, and takedown requests."
        canonicalUrl="/notice-and-takedown"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Notice & Takedown Policy</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Copyright and Content Disputes</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="lead">
                  Football Tournaments UK respects intellectual property rights and provides 
                  clear procedures for addressing copyright concerns and content disputes.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Our Commitment</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    We are committed to:
                  </p>
                  <ul>
                    <li>Respecting copyright and intellectual property rights</li>
                    <li>Responding promptly to legitimate takedown requests</li>
                    <li>Providing fair procedures for content disputes</li>
                    <li>Maintaining transparency in our processes</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Copyright Infringement Claims</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Submitting a DMCA Notice</h3>
                  <p>
                    If you believe your copyrighted work has been used without permission, 
                    please provide us with a written notice containing:
                  </p>
                  
                  <ol>
                    <li><strong>Identification of the copyrighted work</strong> claimed to be infringed</li>
                    <li><strong>Identification of the infringing material</strong> and its location on our site</li>
                    <li><strong>Your contact information</strong> including name, address, telephone number, and email</li>
                    <li><strong>A statement of good faith belief</strong> that the use is not authorised</li>
                    <li><strong>A statement of accuracy</strong> and that you are authorised to act on behalf of the copyright owner</li>
                    <li><strong>Your physical or electronic signature</strong></li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Content Disputes</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Tournament Information Disputes</h3>
                  <p>
                    For disputes regarding tournament listings, pricing, or information accuracy:
                  </p>
                  <ul>
                    <li>Contact us with specific details of the disputed content</li>
                    <li>Provide evidence or documentation supporting your position</li>
                    <li>Include your relationship to the tournament (organiser, venue, etc.)</li>
                  </ul>

                  <h3>Privacy Concerns</h3>
                  <p>
                    If personal information has been published without consent:
                  </p>
                  <ul>
                    <li>Identify the specific information and its location</li>
                    <li>Explain why it should be removed</li>
                    <li>Provide proof of identity if requesting removal of your own information</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Our Response Process</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Initial Response</h3>
                  <ul>
                    <li><strong>Acknowledgment:</strong> Within 24 hours of receiving a complete notice</li>
                    <li><strong>Review:</strong> Assessment of the claim within 2-5 business days</li>
                    <li><strong>Action:</strong> Removal or response based on our findings</li>
                  </ul>

                  <h3>Temporary Removal</h3>
                  <p>
                    For urgent cases or clear violations, we may temporarily remove content 
                    while conducting a full review.
                  </p>

                  <h3>Investigation</h3>
                  <p>
                    We will:
                  </p>
                  <ul>
                    <li>Review the legitimacy of the claim</li>
                    <li>Consider fair use or other defences</li>
                    <li>Contact the content uploader if applicable</li>
                    <li>Make a decision based on available evidence</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Counter-Notification Process</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>If Your Content Was Removed</h3>
                  <p>
                    If you believe your content was removed in error, you may submit a counter-notification including:
                  </p>
                  <ol>
                    <li>Identification of the removed content and its former location</li>
                    <li>A statement under penalty of perjury that you believe the removal was due to mistake or misidentification</li>
                    <li>Your contact information</li>
                    <li>A statement that you consent to jurisdiction of UK courts</li>
                    <li>Your physical or electronic signature</li>
                  </ol>

                  <h3>Counter-Notification Review</h3>
                  <p>
                    We will forward valid counter-notifications to the original claimant. 
                    Content may be restored if no legal action is initiated within 10-14 business days.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Repeat Infringers</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    We reserve the right to terminate accounts of users who repeatedly infringe 
                    copyright or violate our content policies.
                  </p>
                  <p>
                    Multiple validated complaints against the same user may result in:
                  </p>
                  <ul>
                    <li>Warning and content removal</li>
                    <li>Temporary account suspension</li>
                    <li>Permanent account termination</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. False Claims</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Submitting false or bad faith copyright claims may result in:
                  </p>
                  <ul>
                    <li>Legal liability for damages</li>
                    <li>Restriction from submitting future claims</li>
                    <li>Potential counter-claims from affected parties</li>
                  </ul>
                  
                  <p>
                    Please ensure claims are accurate and made in good faith.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Send all notices and takedown requests to:
                  </p>
                  
                  <div className="bg-muted p-4 rounded">
                    <p>
                      <strong>Email:</strong> info@footballtournamentsuk.co.uk<br />
                      <strong>Subject:</strong> DMCA Notice or Content Dispute<br />
                      <strong>Response Time:</strong> 24-48 hours for acknowledgment
                    </p>
                  </div>

                  <p className="mt-4">
                    <strong>Note:</strong> For fastest processing, please use email and include 
                    "DMCA" or "Takedown" in the subject line.
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