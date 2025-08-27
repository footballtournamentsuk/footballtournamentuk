import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Policies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'privacy';
  const isMobile = useIsMobile();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy & Cookies' },
    { id: 'terms', label: 'Terms of Use' },
    { id: 'editorial', label: 'Editorial Policy' },
    { id: 'images', label: 'Image Credits' },
    { id: 'takedown', label: 'Notice & Takedown' },
    { id: 'affiliate', label: 'Affiliate Disclosure' },
    { id: 'pricing', label: 'Pricing Disclaimer' }
  ];

  return (
    <>
      <SEO 
        title="Legal Policies | Football Tournaments UK"
        description="Comprehensive legal policies including privacy, terms of use, editorial standards, and legal procedures for Football Tournaments UK."
        canonicalUrl="/policies"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Legal Policies</h1>
            <p className="text-muted-foreground text-lg">
              Our commitment to privacy, transparency, and legal compliance
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Responsive navigation - dropdown for mobile, tabs for desktop */}
            <div className="mb-8">
              {isMobile ? (
                <div className="w-full">
                  <label htmlFor="policy-select" className="text-sm font-medium text-muted-foreground mb-2 block">
                    Policy
                  </label>
                  <Select value={activeTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue>
                        {tabs.find(tab => tab.id === activeTab)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="w-full z-50 bg-background border border-border">
                      {tabs.map((tab) => (
                        <SelectItem 
                          key={tab.id} 
                          value={tab.id}
                          className="cursor-pointer"
                        >
                          {tab.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-max">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              )}
            </div>

            {/* Privacy & Cookies Tab */}
            <TabsContent value="privacy" id="panel-privacy" role="tabpanel">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Privacy Policy & Cookies</CardTitle>
                  <p className="text-muted-foreground">Last updated: January 2025</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Who We Are</h3>
                      <p>
                        Welcome to Football Tournaments UK – your free online board for football tournament listings across the United Kingdom.
                        Website: footballtournamentsuk.co.uk.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. Purpose</h3>
                      <p>
                        This Privacy Policy explains how we collect, use, and protect your personal data in accordance with UK GDPR.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. What We Collect</h3>
                      <p>We may collect:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Name</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Password (encrypted)</li>
                        <li>Tournament/event information</li>
                        <li>Basic analytics data (IP address, browser type, usage statistics)</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">4. Why We Collect It</h3>
                      <p>We use this data solely for:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Creating and managing your account</li>
                        <li>Publishing your tournament listings</li>
                        <li>Communicating with you about your account or listings</li>
                        <li>Improving our platform&apos;s usability (analytics)</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">5. Data Sharing & Public Display</h3>
                      <p>
                        We do not sell or rent your personal information.
                        We only share data if required by law or with your explicit consent.
                      </p>
                      <p className="mt-3 font-medium">
                        <strong>Important Notice About Tournament Organizer Information:</strong>
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Any personal information (full name, email address, phone number) entered by tournament organizers in their profile may be publicly displayed on their tournament listings.</li>
                        <li>By publishing their profile and tournament details, organizers voluntarily consent to making these contact details publicly available and take full responsibility for the accuracy and sharing of this information.</li>
                        <li>Organizers can edit or remove their contact details at any time through their profile settings.</li>
                        <li>Our platform is not responsible for how third parties may use or contact organizers using the published contact details.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">6. GDPR Rights</h3>
                      <p>You have the right to:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Access your personal data</li>
                        <li>Request corrections or deletion</li>
                        <li>Withdraw consent</li>
                        <li>Request data portability</li>
                      </ul>
                      <p className="mt-2">Contact: info@footballtournamentsuk.co.uk</p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">7. Data Retention</h3>
                      <p>
                        We retain your data only as long as necessary for the purposes described.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">8. Security</h3>
                      <p>
                        We use encryption and secure storage, but no system is 100% secure.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">9. Cookies</h3>
                      <p>
                        Our site uses cookies for analytics and basic functionality. You can disable them in your browser settings.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terms of Use Tab */}
            <TabsContent value="terms" id="panel-terms" role="tabpanel">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Terms of Use</CardTitle>
                  <p className="text-muted-foreground">Last updated: January 2025</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Service Description</h3>
                      <p>
                        Football Tournaments UK is a platform that lists football tournaments and events 
                        across the United Kingdom. We provide information about tournaments but are not 
                        organisers of these events unless explicitly stated.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. Use of Service</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>You must be at least 13 years old to use our service</li>
                        <li>You agree to provide accurate information when creating listings</li>
                        <li>You will not use our service for unlawful purposes</li>
                        <li>You will not attempt to disrupt or harm our service</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. Content and Accuracy</h3>
                      <p>
                        <strong>Information is provided &quot;as-is&quot;.</strong> We make no warranties about the 
                        accuracy, completeness, or timeliness of tournament information. Users should verify 
                        all details directly with tournament organisers.
                      </p>
                      <p>
                        Tournament dates, prices, and details may change without notice. We are not responsible 
                        for cancelled events, schedule changes, or pricing variations.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">4. Limitation of Liability</h3>
                      <p>
                        To the fullest extent permitted by law, Football Tournaments UK shall not be liable 
                        for any indirect, incidental, special, consequential, or punitive damages resulting 
                        from your use of our service.
                      </p>
                      <p>
                        Our total liability for any claims shall not exceed £100 or the amount you paid us 
                        in the 12 months preceding the claim, whichever is less.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">5. Governing Law</h3>
                      <p>
                        These Terms are governed by the laws of England and Wales. Any disputes shall be 
                        subject to the exclusive jurisdiction of the courts of England and Wales.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">6. Contact Information</h3>
                      <p>
                        For questions about these Terms, please contact us at:
                      </p>
                      <p>
                        <strong>Email:</strong> info@footballtournamentsuk.co.uk
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Editorial Policy Tab */}
            <TabsContent value="editorial" id="panel-editorial" role="tabpanel">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Editorial Policy</CardTitle>
                  <p className="text-muted-foreground">Our commitment to quality and accuracy</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Content Standards</h3>
                      <p>
                        We strive to ensure all tournament information is accurate at the time of publication. 
                        This includes dates, venues, pricing, and contact details.
                      </p>
                      <p>
                        Our content aims to be impartial and balanced. We do not favour specific tournaments 
                        or organisers unless clearly marked as sponsored content.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. Verification Process</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Direct communication with tournament organisers</li>
                        <li>Cross-referencing with official tournament websites</li>
                        <li>Verification of venue details and capacity</li>
                        <li>Confirmation of pricing and registration processes</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. Updates and Corrections</h3>
                      <p>
                        When errors are identified, we correct them promptly and transparently. 
                        We welcome feedback from users about accuracy or updates needed.
                      </p>
                      <p>
                        Contact us at info@footballtournamentsuk.co.uk with corrections.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">4. User-Generated Content</h3>
                      <p>
                        Reviews and user comments are moderated to ensure they meet our community standards. 
                        We reserve the right to remove content that is abusive, threatening, discriminatory, 
                        or contains false information.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Image Credits Tab */}
            <TabsContent value="images" id="panel-images" role="tabpanel">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Image Credits & Licensing</CardTitle>
                  <p className="text-muted-foreground">Image usage and attribution policies</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Image Sources</h3>
                      <p>
                        We use properly licensed images from reputable stock photography services including 
                        Unsplash, Pexels, Shutterstock, and Getty Images. Tournament organisers may upload 
                        images related to their events with appropriate licensing rights.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. User Responsibilities</h3>
                      <p>
                        Users uploading images must ensure they have:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Full rights to use and license the image</li>
                        <li>Permission from any identifiable people in the image</li>
                        <li>Rights to grant us a license for platform use</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. Takedown Procedure</h3>
                      <p>
                        If you believe we are using your copyrighted image without permission, please contact us with:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Specific image(s) and location on our site</li>
                        <li>Proof of ownership or representation</li>
                        <li>Your contact information</li>
                        <li>A statement of good faith belief that use is unauthorised</li>
                      </ul>
                      <p>
                        <strong>Contact:</strong> info@footballtournamentsuk.co.uk
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notice & Takedown Tab */}
            <TabsContent value="takedown" id="panel-takedown" role="tabpanel">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Notice & Takedown Policy</CardTitle>
                  <p className="text-muted-foreground">Copyright and content dispute procedures</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Our Commitment</h3>
                      <p>
                        We are committed to respecting copyright and intellectual property rights, 
                        responding promptly to legitimate takedown requests, and providing fair 
                        procedures for content disputes.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. Submitting a DMCA Notice</h3>
                      <p>
                        If you believe your copyrighted work has been used without permission, 
                        please provide us with a written notice containing:
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Identification of the copyrighted work claimed to be infringed</li>
                        <li>Identification of the infringing material and its location on our site</li>
                        <li>Your contact information including name, address, telephone number, and email</li>
                        <li>A statement of good faith belief that the use is not authorised</li>
                        <li>A statement of accuracy and that you are authorised to act on behalf of the copyright owner</li>
                        <li>Your physical or electronic signature</li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. Our Response Process</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Acknowledgment:</strong> Within 24 hours of receiving a complete notice</li>
                        <li><strong>Review:</strong> Assessment of the claim within 2-5 business days</li>
                        <li><strong>Action:</strong> Removal or response based on our findings</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">4. Contact Information</h3>
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
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Affiliate Disclosure Tab */}
            <TabsContent value="affiliate" id="panel-affiliate" role="tabpanel">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Affiliate Disclosure</CardTitle>
                  <p className="text-muted-foreground">Transparency in partnerships</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Affiliate Relationships</h3>
                      <p>
                        As of January 2025, Football Tournaments UK primarily operates as a free 
                        listing service without affiliate partnerships. However, we may develop 
                        affiliate relationships in the future with sports equipment retailers, 
                        tournament management software providers, and related services.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. Clear Labelling</h3>
                      <p>
                        When we include affiliate links, they will be clearly identified with 
                        phrases like &quot;affiliate link&quot; or &quot;sponsored link&quot;, asterisks with explanations, 
                        and disclosure statements.
                      </p>
                      <div className="bg-muted p-4 rounded">
                        <p>
                          &quot;This post contains affiliate links. We may earn a commission 
                          at no extra cost to you if you make a purchase through these links.&quot;
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. Editorial Independence</h3>
                      <p>
                        Our editorial content is never influenced by affiliate relationships. 
                        We maintain strict separation between editorial content and commercial partnerships.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">4. Your Rights</h3>
                      <p>
                        You are never obligated to use affiliate links and can navigate directly 
                        to provider websites, search for alternatives, or choose not to make any purchase.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Disclaimer Tab */}
            <TabsContent value="pricing" id="panel-pricing" role="tabpanel">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Pricing Disclaimer</CardTitle>
                  <p className="text-muted-foreground">Important pricing information</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <div className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded">
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                        ⚠️ All tournament prices and fees are subject to change without notice. 
                        Always verify current pricing directly with tournament organisers before making payments.
                      </p>
                    </div>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Price Information Sources</h3>
                      <p>
                        Tournament pricing information is obtained from tournament organiser submissions, 
                        official websites, and direct communication. However, this information may become 
                        outdated due to early bird discounts expiring, late registration fees, or policy changes.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. Our Role and Limitations</h3>
                      <p>
                        Football Tournaments UK serves as an information platform. We:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>DO NOT</strong> set tournament prices</li>
                        <li><strong>DO NOT</strong> handle payments or booking</li>
                        <li><strong>DO NOT</strong> guarantee price accuracy</li>
                        <li><strong>DO NOT</strong> control pricing policies</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. Verification Steps</h3>
                      <p>
                        Before registering, always verify:
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Current registration fees</li>
                        <li>Payment deadlines and early bird rates</li>
                        <li>Additional costs and fees</li>
                        <li>Refund policy and cancellation terms</li>
                        <li>Accepted payment methods</li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">4. Legal Disclaimer</h3>
                      <p>
                        <strong>Football Tournaments UK disclaims all liability</strong> for financial losses 
                        due to incorrect pricing information, disputes between users and organisers, 
                        tournament changes, or additional undisclosed costs.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}