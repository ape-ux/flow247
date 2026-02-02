import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Ship, Plane, FileCheck, Warehouse, ArrowRight, CreditCard, Settings,
  Shield, Globe2, Users, BarChart3, CheckCircle2, Crown, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ApeGlobalLanding() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Ship,
      title: 'Ocean Freight',
      description: 'FCL and LCL shipping to ports worldwide with competitive rates and reliable transit times.',
    },
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Express and standard air cargo solutions for time-sensitive shipments globally.',
    },
    {
      icon: FileCheck,
      title: 'Customs Brokerage',
      description: 'Expert customs clearance, compliance management, and regulatory support.',
    },
    {
      icon: Warehouse,
      title: 'Warehousing & Distribution',
      description: 'Strategic storage facilities and last-mile delivery across major markets.',
    },
  ];

  const adminFeatures = [
    {
      icon: CreditCard,
      title: 'Subscription Management',
      description: 'Full control over billing, invoicing, and payment processing with Stripe integration.',
    },
    {
      icon: Users,
      title: 'User Administration',
      description: 'Manage users, roles, and permissions across your entire organization.',
    },
    {
      icon: Building2,
      title: 'Multi-Tenant Control',
      description: 'Configure and manage multiple agencies and sub-accounts from one dashboard.',
    },
    {
      icon: BarChart3,
      title: 'Enterprise Analytics',
      description: 'Comprehensive reporting and insights across all platforms and operations.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small freight operations',
      features: ['Up to 50 shipments/month', 'Basic AI agents', 'Email support', '2 team members', 'Standard reporting'],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'For growing logistics companies',
      features: ['Unlimited shipments', 'All 8 AI agents', 'Priority support', 'Up to 15 team members', 'Advanced analytics', 'API access', 'Custom integrations'],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large-scale operations',
      features: ['Everything in Professional', 'Dedicated account manager', 'White-label options', 'Unlimited users', 'SLA guarantee', 'Custom AI training', 'On-premise deployment'],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar brand="apeGlobal" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Floating elements */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-[100px] animate-float" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge-glow mb-8 animate-slide-up">
              <Crown className="h-4 w-4" />
              <span>ENTERPRISE ADMIN & SUBSCRIPTIONS</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up animate-delay-100">
              <span className="text-white">Full-Service</span>
              <br />
              <span className="gradient-text glow-text">Global Logistics.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up animate-delay-200">
              End-to-end supply chain management with enterprise administration.
              Manage subscriptions, users, and operations across Flow247 and Amass platforms.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up animate-delay-300">
              <Button size="lg" className="gradient-primary text-white px-8 py-6 text-lg glow-cyan animate-pulse-glow" asChild>
                <Link to="/admin">
                  Access Admin Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 px-8 py-6 text-lg" asChild>
                <Link to="#pricing">
                  View Pricing
                </Link>
              </Button>
            </div>

            {/* Brand logos */}
            <div className="flex flex-wrap justify-center items-center gap-8 animate-slide-up animate-delay-400">
              <div className="glass-card rounded-lg px-6 py-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">F</span>
                </div>
                <span className="text-white font-semibold">Flow247</span>
              </div>
              <div className="glass-card rounded-lg px-6 py-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-secondary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="text-white font-semibold">Amass</span>
              </div>
              <div className="glass-card rounded-lg px-6 py-3 flex items-center gap-2">
                <Globe2 className="h-6 w-6 text-primary" />
                <span className="text-white font-semibold">Ape Global</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-dark-radial">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="badge-glow mb-4 inline-block">Logistics Services</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Comprehensive{' '}
              <span className="gradient-text">freight solutions.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From ocean to air, customs to warehousing — we handle it all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="feature-card group text-center">
                <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 mx-auto group-hover:glow-cyan transition-all">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="badge-success badge-glow mb-4 inline-block">Admin Portal</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Centralized{' '}
              <span className="gradient-text">administration.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage all applications, subscriptions, and users from one powerful admin portal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminFeatures.map((feature, index) => (
              <div key={index} className="glass-card rounded-xl p-6 text-center group hover:glow-cyan transition-all">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-dark" id="pricing">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="badge-glow mb-4 inline-block">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, <span className="gradient-text">transparent pricing.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. Scale up anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`glass-card rounded-2xl p-8 relative ${
                  plan.highlighted ? 'border-primary glow-cyan-lg scale-105' : 'border-border/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 text-xs font-semibold rounded-full gradient-primary text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.highlighted ? 'gradient-primary text-white glow-cyan' : 'bg-white/5 hover:bg-white/10'}`}
                  size="lg"
                  asChild
                >
                  <Link to="/auth/signup">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-glow mb-4 inline-block">The Ape Global Ecosystem</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Three platforms. <span className="gradient-text">One vision.</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Ape Global provides the administrative backbone for Flow247 and Amass,
                creating a unified ecosystem for modern freight operations.
              </p>
              <div className="space-y-4">
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded gradient-primary flex items-center justify-center">
                      <span className="text-white text-sm font-bold">F</span>
                    </div>
                    <h4 className="font-semibold text-white">Flow247</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">AI-powered freight marketplace with 8 autonomous agents.</p>
                </div>
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                    <h4 className="font-semibold text-white">Amass</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Operations hub for freight professionals and teams.</p>
                </div>
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe2 className="h-8 w-8 text-primary" />
                    <h4 className="font-semibold text-white">Ape Global</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Enterprise admin, subscriptions, and full-service logistics.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="terminal-box glow-cyan">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="text-xs text-muted-foreground ml-2">ape_global_admin // master</span>
                </div>
                <div className="terminal-content text-left">
                  <p className="text-muted-foreground">$ system status check...</p>
                  <p className="text-green-400 mt-2">✓ Flow247: <span className="text-primary">operational</span> (8 agents active)</p>
                  <p className="text-green-400">✓ Amass: <span className="text-primary">operational</span> (247 users online)</p>
                  <p className="text-green-400">✓ Billing: <span className="text-primary">synced</span> (Stripe connected)</p>
                  <p className="text-green-400">✓ Auth: <span className="text-primary">secure</span> (Supabase + Xano)</p>
                  <p className="text-white mt-4">All systems nominal.</p>
                  <p className="text-muted-foreground mt-2">Active subscriptions: <span className="text-secondary">1,247</span></p>
                  <p className="text-muted-foreground animate-pulse mt-2">_ </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to <span className="gradient-text">scale globally?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Partner with Ape Global for enterprise-grade logistics management
            and administrative control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-primary text-white px-12 py-6 text-lg glow-cyan-lg animate-pulse-glow" asChild>
              <Link to="/admin">
                Access Admin Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 px-8 py-6 text-lg" asChild>
              <Link to="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer brand="apeGlobal" />
    </div>
  );
}
