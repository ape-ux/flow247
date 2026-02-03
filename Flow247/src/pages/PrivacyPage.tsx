import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe2, Bell, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  const lastUpdated = 'February 1, 2026';

  const sections = [
    {
      icon: Eye,
      title: '1. Information We Collect',
      content: [
        {
          subtitle: 'Account Information',
          text: 'When you create an account, we collect your name, email address, company name, phone number, and billing information. This information is necessary to provide you with our freight management services.',
        },
        {
          subtitle: 'Shipment Data',
          text: 'We collect shipment details including origin/destination addresses, commodity descriptions, weights, dimensions, carrier selections, and tracking information. This data is essential for managing your freight operations.',
        },
        {
          subtitle: 'Usage Data',
          text: 'We automatically collect information about how you interact with our platform, including pages visited, features used, search queries, and session duration. This helps us improve our services.',
        },
        {
          subtitle: 'Device & Technical Data',
          text: 'We collect browser type, operating system, IP address, and device identifiers to ensure security and optimize your experience across different devices.',
        },
      ],
    },
    {
      icon: Database,
      title: '2. How We Use Your Information',
      content: [
        {
          subtitle: 'Service Delivery',
          text: 'We use your information to process quotes, manage shipments, connect with carriers, generate invoices, and provide customer support. Our AI agents use shipment data to optimize routing and pricing.',
        },
        {
          subtitle: 'Platform Improvement',
          text: 'We analyze aggregated and anonymized usage data to improve our platform features, develop new AI capabilities, and enhance the overall user experience.',
        },
        {
          subtitle: 'Communications',
          text: 'We send transactional emails (shipment updates, quote confirmations, LFD alerts), security notifications, and occasional product updates. You can opt out of non-essential communications at any time.',
        },
        {
          subtitle: 'Legal & Compliance',
          text: 'We may use your information to comply with applicable laws, respond to legal requests, enforce our terms, and protect against fraud or security threats.',
        },
      ],
    },
    {
      icon: Lock,
      title: '3. Data Security',
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data transmitted to and from Flow247 is encrypted using TLS 1.3. Data at rest is encrypted using AES-256 encryption. API keys and authentication tokens are hashed and never stored in plain text.',
        },
        {
          subtitle: 'Infrastructure',
          text: 'Our infrastructure is hosted on AWS with SOC 2 Type II certified data centers. We implement network segmentation, intrusion detection systems, and continuous monitoring.',
        },
        {
          subtitle: 'Access Controls',
          text: 'We enforce role-based access controls, multi-factor authentication for administrative access, and regular access reviews. Employee access to customer data is logged and audited.',
        },
      ],
    },
    {
      icon: Globe2,
      title: '4. Data Sharing & Third Parties',
      content: [
        {
          subtitle: 'Carrier Integrations',
          text: 'We share necessary shipment information with carriers (TAI, TQL, Estes, ExFreight, Maersk, etc.) to obtain rate quotes, book shipments, and enable tracking. Only the minimum required data is shared.',
        },
        {
          subtitle: 'Service Providers',
          text: 'We use trusted third-party services for payment processing (Stripe), email delivery (SendGrid), authentication (Supabase), and analytics. These providers are bound by data processing agreements.',
        },
        {
          subtitle: 'No Data Sales',
          text: 'We never sell your personal information or shipment data to third parties for marketing or advertising purposes. Your data is yours.',
        },
      ],
    },
    {
      icon: Bell,
      title: '5. Cookies & Tracking',
      content: [
        {
          subtitle: 'Essential Cookies',
          text: 'We use essential cookies for authentication, session management, and security. These cannot be disabled as they are necessary for the platform to function.',
        },
        {
          subtitle: 'Analytics',
          text: 'We use analytics tools to understand how users interact with our platform. This data is aggregated and does not personally identify you. You can opt out via Cookie Preferences in the footer.',
        },
        {
          subtitle: 'No Third-Party Advertising',
          text: 'We do not use advertising cookies or tracking pixels from third-party ad networks.',
        },
      ],
    },
    {
      icon: Trash2,
      title: '6. Data Retention & Deletion',
      content: [
        {
          subtitle: 'Retention Period',
          text: 'We retain your account data for as long as your account is active. Shipment records are retained for 7 years to comply with freight industry record-keeping requirements and tax regulations.',
        },
        {
          subtitle: 'Account Deletion',
          text: 'You may request account deletion at any time by contacting support@flow247.com. Upon deletion, we will remove your personal data within 30 days, except where retention is required by law.',
        },
        {
          subtitle: 'Data Portability',
          text: 'You can export your shipment data, quotes, and account information in standard formats (CSV, JSON) through the Settings page or by contacting our support team.',
        },
      ],
    },
    {
      icon: Shield,
      title: '7. Your Rights',
      content: [
        {
          subtitle: 'Access & Correction',
          text: 'You have the right to access, correct, or update your personal information at any time through your account settings or by contacting us.',
        },
        {
          subtitle: 'CCPA/GDPR Rights',
          text: 'Depending on your jurisdiction, you may have additional rights including the right to know what data we collect, the right to deletion, the right to opt out of data sharing, and the right to non-discrimination.',
        },
        {
          subtitle: 'Contact Us',
          text: 'For privacy-related questions or to exercise your rights, contact our Privacy Team at privacy@flow247.com or write to: Flow247 Pro Inc., Miami, FL 33126, USA.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
          </Button>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Your Data, Your Rights</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              At Flow247, we take your privacy seriously. This policy explains how we collect, use, protect, and share your information when you use our freight management platform.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-12">
            {sections.map((section, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <section.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="space-y-6 pl-12">
                  {section.content.map((item, j) => (
                    <div key={j}>
                      <h3 className="font-semibold text-foreground mb-2">{item.subtitle}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-8 mt-12">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Questions About Your Privacy?</h3>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please don't hesitate to reach out.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <a href="mailto:privacy@flow247.com">Email Privacy Team</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="mailto:ape@apeglobal.io">General Support</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
