import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

export default function PricingDisclaimer() {
  return (
    <>
      <SEO 
        title="Pricing Disclaimer | Football Tournaments UK"
        description="Important information about tournament pricing, fees, and booking conditions. Always verify current prices with organisers."
        canonicalUrl="/pricing-disclaimer"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Pricing Disclaimer</h1>
            
            <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Important Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="lead text-yellow-800 dark:text-yellow-200">
                  All tournament prices and fees are subject to change without notice. 
                  Always verify current pricing directly with tournament organisers before making payments.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Price Information Sources</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Where We Get Pricing</h3>
                  <p>
                    Tournament pricing information is obtained from:
                  </p>
                  <ul>
                    <li>Tournament organiser submissions and updates</li>
                    <li>Official tournament websites and documentation</li>
                    <li>Direct communication with event organisers</li>
                    <li>Publicly available promotional materials</li>
                  </ul>

                  <h3>Information Currency</h3>
                  <p>
                    Pricing information is accurate at the time of publication but may become 
                    outdated due to:
                  </p>
                  <ul>
                    <li>Early bird discounts expiring</li>
                    <li>Late registration fees being applied</li>
                    <li>Capacity-based pricing tiers</li>
                    <li>Organiser pricing policy changes</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Types of Pricing Variables</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Registration Fees</h3>
                  <ul>
                    <li><strong>Early Bird Rates:</strong> Limited time discounted pricing</li>
                    <li><strong>Standard Rates:</strong> Regular registration fees</li>
                    <li><strong>Late Registration:</strong> Higher fees for last-minute entries</li>
                    <li><strong>Group Discounts:</strong> Reduced rates for multiple team entries</li>
                  </ul>

                  <h3>Additional Costs</h3>
                  <p>
                    Listed prices may not include:
                  </p>
                  <ul>
                    <li>Payment processing fees</li>
                    <li>Insurance requirements</li>
                    <li>Equipment or kit deposits</li>
                    <li>Referee fees or facility charges</li>
                    <li>Accommodation or travel costs</li>
                    <li>Food and refreshment charges</li>
                  </ul>

                  <h3>Refund Policies</h3>
                  <p>
                    Refund terms vary by organiser and may include:
                  </p>
                  <ul>
                    <li>Non-refundable deposits</li>
                    <li>Cancellation deadlines</li>
                    <li>Administrative fees for refunds</li>
                    <li>Transfer fees for team changes</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Our Role and Limitations</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Information Provider Only</h3>
                  <p>
                    Football Tournaments UK serves as an information platform. We:
                  </p>
                  <ul>
                    <li><strong>DO NOT</strong> set tournament prices</li>
                    <li><strong>DO NOT</strong> handle payments or booking</li>
                    <li><strong>DO NOT</strong> guarantee price accuracy</li>
                    <li><strong>DO NOT</strong> control pricing policies</li>
                  </ul>

                  <h3>Direct Booking Required</h3>
                  <p>
                    All registrations and payments must be made directly with tournament organisers. 
                    We are not involved in:
                  </p>
                  <ul>
                    <li>Payment processing</li>
                    <li>Booking confirmations</li>
                    <li>Refund processing</li>
                    <li>Dispute resolution regarding fees</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Price Verification Steps</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Before Registering</h3>
                  <p>
                    Always verify the following directly with organisers:
                  </p>
                  <ol>
                    <li><strong>Current Registration Fees</strong> - Confirm exact amounts</li>
                    <li><strong>Payment Deadlines</strong> - Check early bird and standard deadlines</li>
                    <li><strong>Additional Costs</strong> - Ask about any extra fees</li>
                    <li><strong>Refund Policy</strong> - Understand cancellation terms</li>
                    <li><strong>Payment Methods</strong> - Confirm accepted payment options</li>
                  </ol>

                  <h3>Contact Methods</h3>
                  <p>
                    Verify pricing through:
                  </p>
                  <ul>
                    <li>Official tournament website</li>
                    <li>Direct email or phone contact</li>
                    <li>Social media official accounts</li>
                    <li>Registration platform or booking system</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Common Pricing Changes</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Seasonal Variations</h3>
                  <p>
                    Tournament prices may change based on:
                  </p>
                  <ul>
                    <li>Season timing (summer vs winter tournaments)</li>
                    <li>Venue availability and demand</li>
                    <li>Competition level and format</li>
                    <li>Prize fund or award structures</li>
                  </ul>

                  <h3>Market Factors</h3>
                  <p>
                    External factors affecting pricing:
                  </p>
                  <ul>
                    <li>Facility rental cost increases</li>
                    <li>Insurance and safety requirement changes</li>
                    <li>Referee and official fee adjustments</li>
                    <li>Economic conditions and inflation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Free Tournament Listings</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>No-Cost Events</h3>
                  <p>
                    Some tournaments listed as "free" may still involve:
                  </p>
                  <ul>
                    <li>Registration requirements</li>
                    <li>Insurance or liability waivers</li>
                    <li>Equipment or uniform requirements</li>
                    <li>Optional services with charges</li>
                  </ul>

                  <h3>Sponsored Events</h3>
                  <p>
                    Free events may be sponsored and could include:
                  </p>
                  <ul>
                    <li>Limited capacity</li>
                    <li>Specific eligibility criteria</li>
                    <li>Promotional activities or requirements</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Reporting Price Issues</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Outdated Information</h3>
                  <p>
                    If you find incorrect pricing information on our platform, please help us by:
                  </p>
                  <ul>
                    <li>Contacting us with the specific tournament and pricing details</li>
                    <li>Providing the correct information and source</li>
                    <li>Including any documentation if available</li>
                  </ul>

                  <h3>Contact for Updates</h3>
                  <p>
                    <strong>Email:</strong> info@footballtournamentsuk.co.uk<br />
                    <strong>Subject:</strong> Pricing Update - [Tournament Name]
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Legal Disclaimer</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    <strong>Football Tournaments UK disclaims all liability</strong> for:
                  </p>
                  <ul>
                    <li>Financial losses due to incorrect pricing information</li>
                    <li>Disputes between users and tournament organisers</li>
                    <li>Changes in tournament fees or policies</li>
                    <li>Cancelled or postponed events</li>
                    <li>Additional costs not disclosed in listings</li>
                  </ul>

                  <p>
                    <strong>Users participate in tournaments at their own risk</strong> and should 
                    make independent inquiries before making financial commitments.
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