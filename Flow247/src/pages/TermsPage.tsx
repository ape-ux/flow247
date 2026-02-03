import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, CreditCard, Ban, RefreshCw, Globe2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  const lastUpdated = 'February 1, 2026';

  const sections = [
    {
      icon: FileText,
      title: '1. Acceptance of Terms',
      content: [
        {
          subtitle: 'Agreement',
          text: 'By accessing or using Flow247 ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Platform on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.',
        },
        {
          subtitle: 'Eligibility',
          text: 'You must be at least 18 years old and have the legal capacity to enter into contracts to use our services. The Platform is designed for business use in the freight and logistics industry.',
        },
        {
          subtitle: 'Modifications',
          text: 'We may update these Terms from time to time. We will notify you of material changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the updated Terms.',
        },
      ],
    },
    {
      icon: Scale,
      title: '2. Services Description',
      content: [
        {
          subtitle: 'Platform Services',
          text: 'Flow247 provides an AI-powered freight management platform that includes rate quoting, shipment booking, carrier management, real-time tracking, LFD monitoring, CFS operations management, and automated customer communications.',
        },
        {
          subtitle: 'AI-Powered Features',
          text: 'Our platform uses artificial intelligence agents to assist with freight operations. While our AI agents are designed to be accurate, all AI-generated content, recommendations, and automated actions should be reviewed by qualified personnel. We do not guarantee the accuracy of AI outputs.',
        },
        {
          subtitle: 'Third-Party Integrations',
          text: 'The Platform integrates with third-party carrier APIs (TAI, TQL, Estes, ExFreight, Maersk, etc.), payment processors (Stripe), and other services. Your use of these integrations is also subject to the respective third-party terms of service.',
        },
        {
          subtitle: 'Availability',
          text: 'We strive for 99.9% uptime but do not guarantee uninterrupted access. Scheduled maintenance windows, third-party API outages, and force majeure events may affect availability.',
        },
      ],
    },
    {
      icon: CreditCard,
      title: '3. Accounts & Billing',
      content: [
        {
          subtitle: 'Account Registration',
          text: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.',
        },
        {
          subtitle: 'Subscription Plans',
          text: 'Flow247 offers multiple subscription tiers (Starter, Professional, Enterprise). Each plan includes specific features, usage limits, and user seat allocations as described on our Pricing page. Features may vary by plan.',
        },
        {
          subtitle: 'Billing & Payments',
          text: 'Subscription fees are billed in advance on a monthly or annual basis. All payments are processed securely through Stripe. Prices are in USD unless otherwise specified. Applicable taxes will be added to your invoice.',
        },
        {
          subtitle: 'Cancellation',
          text: 'You may cancel your subscription at any time through the Billing page. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods, except as required by law.',
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: '4. User Responsibilities',
      content: [
        {
          subtitle: 'Accurate Data',
          text: 'You are responsible for the accuracy of all shipment data, commodity descriptions, weights, dimensions, and hazardous material declarations entered into the Platform. Inaccurate data may result in carrier penalties, billing adjustments, or service disruptions.',
        },
        {
          subtitle: 'Compliance',
          text: 'You agree to comply with all applicable federal, state, and international laws and regulations related to freight transportation, including FMCSA regulations, customs requirements, hazmat handling rules, and trade compliance laws.',
        },
        {
          subtitle: 'Acceptable Use',
          text: 'You agree not to: (a) use the Platform for any unlawful purpose; (b) attempt to gain unauthorized access to other accounts or systems; (c) reverse-engineer, decompile, or disassemble any part of the Platform; (d) use automated tools to scrape or extract data beyond your account scope; (e) transmit viruses, malware, or other harmful code.',
        },
        {
          subtitle: 'API Usage',
          text: 'If you access the Platform via our API, you must comply with our API rate limits and usage policies. API keys are confidential and must not be shared publicly or embedded in client-side code.',
        },
      ],
    },
    {
      icon: Ban,
      title: '5. Limitation of Liability',
      content: [
        {
          subtitle: 'Service Limitations',
          text: 'Flow247 acts as a technology platform facilitating freight management operations. We are not a carrier, freight forwarder, or customs broker. We do not take possession of, or assume liability for, any physical shipments.',
        },
        {
          subtitle: 'Rate Accuracy',
          text: 'While we strive to display accurate carrier rates, all quotes provided through the Platform are estimates and may be subject to change based on actual shipment characteristics, accessorial charges, or carrier rate adjustments.',
        },
        {
          subtitle: 'Damages Cap',
          text: 'To the maximum extent permitted by law, Flow247\'s total liability for any claim arising from your use of the Platform shall not exceed the amount you paid for the Platform in the 12 months preceding the claim.',
        },
        {
          subtitle: 'Disclaimer of Warranties',
          text: 'The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
        },
      ],
    },
    {
      icon: RefreshCw,
      title: '6. Intellectual Property',
      content: [
        {
          subtitle: 'Platform Ownership',
          text: 'The Platform, including its design, code, AI models, algorithms, documentation, and branding, is owned by Flow247 Pro Inc. and protected by intellectual property laws. Your subscription grants you a limited, non-exclusive license to use the Platform.',
        },
        {
          subtitle: 'Your Data',
          text: 'You retain ownership of all shipment data, customer information, and other content you upload to the Platform. By using the Platform, you grant us a limited license to process your data solely for the purpose of providing our services.',
        },
        {
          subtitle: 'Feedback',
          text: 'If you provide feedback, suggestions, or improvement ideas, we may use them to enhance the Platform without obligation to you. You are not required to provide feedback.',
        },
      ],
    },
    {
      icon: Globe2,
      title: '7. Governing Law & Disputes',
      content: [
        {
          subtitle: 'Governing Law',
          text: 'These Terms are governed by the laws of the State of Florida, United States, without regard to conflict of law principles.',
        },
        {
          subtitle: 'Dispute Resolution',
          text: 'Any disputes arising from these Terms or your use of the Platform shall first be addressed through good-faith negotiation. If unresolved within 30 days, disputes shall be resolved through binding arbitration in Miami-Dade County, Florida, under the rules of the American Arbitration Association.',
        },
        {
          subtitle: 'Class Action Waiver',
          text: 'You agree that any claims will be brought in your individual capacity and not as a plaintiff or class member in any purported class or representative proceeding.',
        },
        {
          subtitle: 'Severability',
          text: 'If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.',
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
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Legal Agreement</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Please read these Terms of Service carefully before using the Flow247 platform. These terms govern your access to and use of our AI-powered freight management services.
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
                  <h3 className="text-lg font-semibold mb-2">Questions About These Terms?</h3>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about these Terms of Service, please contact our legal team.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <a href="mailto:legal@flow247.com">Contact Legal</a>
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
