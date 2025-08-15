import { Helmet, HelmetProvider } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function Policies() {
  return <HelmetProvider>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Policies - Football Tournaments UK</title>
          <meta name="description" content="Privacy Policy and Terms & Conditions for Football Tournaments UK - your free online board for football tournament listings." />
          <link rel="canonical" href="https://footballtournamentsuk.co.uk/policies" />
        </Helmet>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Policies</h1>
            <p className="text-muted-foreground text-lg">
              Our commitment to privacy and transparent terms of service
            </p>
          </div>

          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            </TabsList>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Privacy Policy</CardTitle>
                  <p className="text-muted-foreground">Last updated: 17.08.2025</p>
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
                        <li>Improving our platform's usability (analytics)</li>
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

            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Terms & Conditions</CardTitle>
                  <p className="text-muted-foreground">Last updated: [Insert Date]</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold mb-3">1. Nature of Our Service</h3>
                      <p>
                        Football Tournaments UK is only a listing board for football tournaments.
                        We do not organize, manage, or endorse any events posted on our platform.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">2. Disclaimer & Liability</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>We are not responsible for the accuracy of information in tournament listings.</li>
                        <li>We do not guarantee event availability, quality, or safety.</li>
                        <li>Participation in any event found on our site is entirely at your own risk.</li>
                        <li>We are not liable for cancellations, injuries, losses, or disputes between organizers and participants.</li>
                        <li><strong>We are not responsible for how third parties may use, contact, or interact with tournament organizers using the publicly displayed contact information.</strong></li>
                        <li>Any misuse of organizer contact details by third parties is beyond our control and responsibility.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">3. User Responsibilities</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Organizers must ensure their listings are accurate and lawful.</li>
                        <li>Users must verify event details with organizers before participating.</li>
                        <li><strong>Tournament organizers acknowledge and agree that by creating a profile and publishing tournament listings, their contact information (name, email, phone number) will be publicly displayed and accessible to all users of the platform.</strong></li>
                        <li>Organizers are solely responsible for the accuracy of their contact information and any consequences arising from making this information publicly available.</li>
                        <li>Organizers understand they can modify or remove their contact details at any time through their profile settings.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">4. Account Termination</h3>
                      <p>
                        We reserve the right to remove listings or terminate accounts that violate our guidelines or the law.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">5. Changes to These Terms</h3>
                      <p>
                        We may update these Terms at any time. Continued use of the site constitutes acceptance of the updated terms.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold mb-3">6. Governing Law</h3>
                      <p>
                        These Terms are governed by the laws of the United Kingdom.
                      </p>
                    </section>

                    <section className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-center font-medium">
                        📧 For all enquiries: info@footballtournamentsuk.co.uk
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HelmetProvider>;
}