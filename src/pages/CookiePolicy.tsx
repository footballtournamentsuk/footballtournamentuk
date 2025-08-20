import { Helmet, HelmetProvider } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiePolicy() {
  return (
    <HelmetProvider>
      <div className="min-h-screen">
        <Helmet>
          <title>Cookie Policy - Football Tournaments UK</title>
          <meta 
            name="description" 
            content="Learn how Football Tournaments UK uses cookies to improve your browsing experience and provide personalized services. UK GDPR compliant cookie policy." 
          />
          <link rel="canonical" href="https://footballtournamentsuk.co.uk/cookie-policy" />
        </Helmet>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground text-lg">
              How we use cookies to enhance your experience on our platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Cookie Policy</CardTitle>
              <p className="text-muted-foreground">Effective Date: [Insert Date]</p>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none dark:prose-invert">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                  <p>
                    This Cookie Policy explains how Football Tournaments UK ("we", "our", or "us") uses cookies and similar technologies on our website footballtournamentsuk.co.uk.
                  </p>
                  <p>
                    By continuing to browse or use our site, you agree to the use of cookies as described in this policy, unless you choose to disable them.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. What Are Cookies?</h2>
                  <p>
                    Cookies are small text files placed on your device when you visit a website. They are widely used to make websites function, improve efficiency, and provide information to website owners.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Types of Cookies We Use</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Essential Cookies</h3>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Necessary for website functionality (e.g., navigation, security, and login).</li>
                        <li>These cannot be disabled.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Analytics Cookies</h3>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Help us understand how visitors use our site (e.g., Google Analytics).</li>
                        <li>Used to improve content and user experience.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Marketing Cookies</h3>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>May be used to deliver relevant advertising or content.</li>
                        <li>We currently do not run targeted advertising but may in the future.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. How We Use Cookies</h2>
                  <p>We use cookies for:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Enabling secure sign-ins for tournament organizers.</li>
                    <li>Saving user preferences.</li>
                    <li>Measuring site traffic and performance.</li>
                    <li>Preventing fraudulent activity.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Managing Cookies</h2>
                  <p>You can control cookies through:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Our Cookie Consent Tool (Accept, Decline, or Custom Settings).</li>
                    <li>Your browser settings — you can block or delete cookies at any time.</li>
                  </ul>
                  <p className="mt-2">
                    <strong>Note:</strong> Disabling cookies may affect website functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Third-Party Cookies</h2>
                  <p>
                    Some cookies are set by third-party services (e.g., Mapbox for maps, Supabase for backend services). We are not responsible for third-party cookie practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
                  <p>
                    We may update this Cookie Policy from time to time. Any changes will be posted here with a revised effective date.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
                  <p>
                    If you have any questions about our use of cookies, please contact us:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg mt-2">
                    <p className="text-center font-medium">
                      📧 info@footballtournamentsuk.co.uk
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HelmetProvider>
  );
}