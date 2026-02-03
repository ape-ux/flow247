import { Link } from 'react-router-dom';
import {
  ArrowLeft, Shield, Lock, Server, Eye, FileCheck, AlertTriangle,
  CheckCircle2, Globe2, Key, Database, Monitor, Mail, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function SecurityPage() {
  const certifications = [
    {
      icon: BadgeCheck,
      title: 'SOC 2 Type II',
      description: 'Our infrastructure provider maintains SOC 2 Type II certification, ensuring rigorous security controls for data handling, availability, and confidentiality.',
      status: 'Compliant',
    },
    {
      icon: Shield,
      title: 'GDPR',
      description: 'We comply with the General Data Protection Regulation for all users in the European Economic Area, including data portability and right-to-erasure requirements.',
      status: 'Compliant',
    },
    {
      icon: Globe2,
      title: 'CCPA',
      description: 'We comply with the California Consumer Privacy Act, providing California residents with enhanced rights over their personal information.',
      status: 'Compliant',
    },
    {
      icon: FileCheck,
      title: 'PCI DSS',
      description: 'Payment processing is handled by Stripe, which is PCI DSS Level 1 certified. We never store credit card numbers on our servers.',
      status: 'Via Stripe',
    },
  ];

  const securityMeasures = [
    {
      icon: Lock,
      title: 'Encryption',
      items: [
        'TLS 1.3 for all data in transit',
        'AES-256 encryption for data at rest',
        'End-to-end encryption for sensitive API communications',
        'Hashed and salted password storage (bcrypt)',
        'Encrypted database backups',
      ],
    },
    {
      icon: Server,
      title: 'Infrastructure',
      items: [
        'AWS cloud infrastructure with multi-AZ deployment',
        'DDoS protection and Web Application Firewall (WAF)',
        'Network segmentation and private subnets',
        'Automated security patching and vulnerability scanning',
        'Geo-redundant data backups with 99.99% durability',
      ],
    },
    {
      icon: Key,
      title: 'Authentication & Access',
      items: [
        'JWT-based authentication with short-lived tokens',
        'Role-based access control (RBAC) with least-privilege principle',
        'Multi-factor authentication (MFA) support',
        'Session management with automatic timeout',
        'API key scoping with rate limiting per tenant',
      ],
    },
    {
      icon: Monitor,
      title: 'Monitoring & Response',
      items: [
        '24/7 automated threat detection and alerting',
        'Real-time log aggregation and anomaly detection',
        'Intrusion detection systems (IDS)',
        'Incident response plan with defined escalation procedures',
        'Regular penetration testing by third-party security firms',
      ],
    },
    {
      icon: Database,
      title: 'Data Protection',
      items: [
        'Automated daily backups with 30-day retention',
        'Point-in-time recovery capability',
        'Data isolation between tenants',
        'Automated PII detection and classification',
        'Data retention policies aligned with industry regulations',
      ],
    },
    {
      icon: Eye,
      title: 'Privacy & Compliance',
      items: [
        'Privacy-by-design architecture',
        'Data Processing Agreements (DPA) with all sub-processors',
        'Annual security awareness training for all employees',
        'Regular third-party security audits',
        'Transparent data handling practices documented in our Privacy Policy',
      ],
    },
  ];

  const industryCompliance = [
    {
      title: 'FMCSA Compliance',
      description: 'Our platform is designed to support compliance with Federal Motor Carrier Safety Administration regulations, including broker registration requirements and record-keeping obligations.',
    },
    {
      title: 'C-TPAT Alignment',
      description: 'Flow247 supports Customs-Trade Partnership Against Terrorism (C-TPAT) requirements by maintaining secure data handling practices and supply chain visibility.',
    },
    {
      title: 'IATA e-Freight',
      description: 'Our document management system supports electronic freight documentation standards for air cargo operations.',
    },
    {
      title: 'AES/ACE Filing',
      description: 'Integration support for Automated Export System and Automated Commercial Environment filings for international shipments.',
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
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-green-500">Enterprise-Grade Protection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Compliance & <span className="gradient-text">Security</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Security isn't an afterthought at Flow247 -- it's foundational. We protect your freight data with enterprise-grade encryption, continuous monitoring, and industry-leading compliance standards.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <cert.icon className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{cert.title}</h3>
                    <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {cert.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Security Measures</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Multiple layers of protection safeguard your data at every level of our stack.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityMeasures.map((measure, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <measure.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">{measure.title}</h3>
                </div>
                <ul className="space-y-2">
                  {measure.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Compliance */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Industry Compliance</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built for the freight industry with specialized compliance support.
          </p>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {industryCompliance.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-xl border border-border/50 bg-card/50 p-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Report a Vulnerability</h3>
                <p className="text-muted-foreground mb-4">
                  We value the security research community. If you believe you've found a security vulnerability in Flow247, please report it responsibly. We commit to acknowledging reports within 24 hours and working with researchers to resolve issues promptly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <a href="mailto:security@flow247.com">Email Security Team</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/privacy">View Privacy Policy</Link>
                  </Button>
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
