import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg">
              <strong className="text-foreground">Effective Date:</strong> January 1, 2025
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the FreightFlow Pro platform operated by Ape Global LL ("Company," "we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">2. Description of Service</h2>
              <p>
                FreightFlow Pro is an AI-powered freight and logistics management platform designed for independent brokers and multi-location 3PLs. Our services include carrier rate management, shipment tracking, quoting tools, and AI-powered analytics.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">3. User Accounts</h2>
              <p>To access our services, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account with accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized use</li>
                <li>Be at least 18 years old or the legal age in your jurisdiction</li>
              </ul>
              <p>
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">4. Subscription and Payments</h2>
              <p>
                Access to certain features requires a paid subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pay all applicable fees as described in your selected plan</li>
                <li>Provide accurate billing information</li>
                <li>Authorize recurring charges until cancellation</li>
              </ul>
              <p>
                Subscription fees are non-refundable except as required by law or as explicitly stated in our refund policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use our services for any unlawful purpose</li>
                <li>Interfere with or disrupt the platform</li>
                <li>Attempt to gain unauthorized access to any systems</li>
                <li>Transmit viruses or malicious code</li>
                <li>Collect user information without consent</li>
                <li>Resell or redistribute our services without authorization</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of FreightFlow Pro are owned by Ape Global LL and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without prior written consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">7. Data and Privacy</h2>
              <p>
                Your use of our services is also governed by our Privacy Policy. By using FreightFlow Pro, you consent to the collection and use of information as described therein.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">8. Disclaimer of Warranties</h2>
              <p>
                Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Ape Global LL shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">10. Termination</h2>
              <p>
                We may terminate or suspend your account at any time for violations of these terms. Upon termination, your right to use the services will immediately cease.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will provide notice of significant changes through our platform or via email. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">12. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-primary">legal@apeglobal.com</p>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
