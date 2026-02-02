import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, X, Zap, Building2, Rocket, ArrowRight, Shield, Clock,
  Users, Bot, Container, BarChart3, Phone, Mail, Star, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createCheckoutSession } from '@/lib/stripe';

// Plan data synced from Xano subscription_plan table (workspace 1)
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small freight brokers getting started',
    price: {
      monthly: 25,
      annually: 25, // $300/yr = $25/mo
    },
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    popular: false,
    contactSales: false,
    features: [
      { text: 'Up to 100 shipments/month', included: true },
      { text: '2 user seats', included: true },
      { text: 'Basic carrier rate lookups', included: true },
      { text: '3 carrier integrations', included: true },
      { text: 'Email support (48hr response)', included: true },
      { text: 'AI-powered rate optimization', included: false },
      { text: 'Full carrier API integrations', included: false },
      { text: 'Multi-location support', included: false },
      { text: 'Dedicated API access', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free Trial',
    stripePriceId: {
      monthly: 'price_1Sf6ap4Z50BH2Sx6ucws0cps',
      annually: 'price_1Sf6ap4Z50BH2Sx6ucws0cps',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing logistics companies with advanced needs',
    price: {
      monthly: 99,
      annually: 99, // $1,188/yr = $99/mo
    },
    icon: Building2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    popular: true,
    contactSales: false,
    features: [
      { text: 'Up to 500 shipments/month', included: true },
      { text: '10 user seats', included: true },
      { text: 'Full carrier API integrations', included: true },
      { text: 'AI-powered rate optimization', included: true },
      { text: 'Priority support (24hr response)', included: true },
      { text: 'Basic carrier rate lookups', included: true },
      { text: 'All carrier integrations', included: true },
      { text: 'Multi-location support', included: false },
      { text: 'Dedicated API access', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free Trial',
    stripePriceId: {
      monthly: 'price_1Sf5qo4Z50BH2Sx6B4B0u21K',
      annually: 'price_1Sf5qo4Z50BH2Sx6B4B0u21K',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full-scale solution for large freight operations',
    price: {
      monthly: 0,
      annually: 0,
    },
    icon: Rocket,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    popular: false,
    contactSales: true,
    features: [
      { text: 'Unlimited shipments', included: true },
      { text: 'Unlimited users', included: true },
      { text: 'Multi-location support', included: true },
      { text: 'Dedicated API access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Full carrier API integrations', included: true },
      { text: 'AI-powered rate optimization', included: true },
      { text: 'Priority support (24hr response)', included: true },
      { text: 'Custom integrations & webhooks', included: true },
      { text: 'All features included', included: true },
    ],
    cta: 'Contact Sales',
    stripePriceId: {
      monthly: '',
      annually: '',
    },
  },
];

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.',
  },
  {
    question: 'What happens after my free trial?',
    answer: 'After your 14-day free trial, you\'ll be automatically subscribed to your chosen plan. You can cancel anytime before the trial ends.',
  },
  {
    question: 'Do you offer custom enterprise plans?',
    answer: 'Absolutely! Contact our sales team for custom pricing based on your specific needs, volume, and integration requirements.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for Enterprise customers.',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle checkout canceled redirect
  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout was canceled. You can try again anytime.');
    }
  }, [searchParams]);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (plan.id === 'enterprise') {
      window.location.href = '/contact';
      return;
    }

    // Require authentication before checkout
    if (!isAuthenticated) {
      toast.info('Please sign in first to subscribe to a plan.');
      navigate(`/auth/signup?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const { url } = await createCheckoutSession({
        priceId: plan.stripePriceId[billingCycle],
        planId: plan.id,
        billingCycle,
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to start checkout. Please try again.'
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar brand="flow247" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-slide-up">
              <Sparkles className="h-4 w-4" />
              <span>Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Choose the plan that
              <span className="gradient-text"> fits your business</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              Start with a 14-day free trial. No credit card required.
              Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-muted/50 border border-border/50 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'annually'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annually
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-500">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className={`relative glass-card rounded-2xl p-8 animate-slide-up ${
                  plan.popular ? 'ring-2 ring-primary glow-cyan' : ''
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${plan.bgColor}`}>
                    <plan.icon className={`h-6 w-6 ${plan.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <div className="mb-6">
                  {plan.contactSales ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">Custom</span>
                      <span className="text-muted-foreground">/contact sales</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${plan.price[billingCycle]}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {billingCycle === 'annually' && (
                        <p className="text-sm text-green-500 mt-1">
                          Billed ${plan.price.annually * 12}/year
                        </p>
                      )}
                    </>
                  )}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full mb-6 ${
                    plan.popular
                      ? 'gradient-primary text-white glow-cyan'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-12 lg:py-20 bg-gradient-dark-radial">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare all features</h2>
            <p className="text-muted-foreground">See exactly what you get with each plan</p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 font-medium">Starter</th>
                  <th className="text-center py-4 px-4 font-medium text-primary">Professional</th>
                  <th className="text-center py-4 px-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Shipments per month', starter: '100', professional: '500', enterprise: 'Unlimited' },
                  { feature: 'User seats', starter: '2', professional: '10', enterprise: 'Unlimited' },
                  { feature: 'Carrier rate lookups', starter: 'Basic', professional: 'Full API', enterprise: 'Full API' },
                  { feature: 'Carrier integrations', starter: '3', professional: 'All', enterprise: 'All + Custom' },
                  { feature: 'AI-powered optimization', starter: false, professional: true, enterprise: true },
                  { feature: 'Multi-location support', starter: false, professional: false, enterprise: true },
                  { feature: 'Dedicated API access', starter: false, professional: false, enterprise: true },
                  { feature: 'Support', starter: 'Email (48hr)', professional: 'Priority (24hr)', enterprise: 'Dedicated' },
                  { feature: 'Account manager', starter: false, professional: false, enterprise: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="py-4 px-4 text-sm">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                      ) : (
                        <span className="text-sm">{row.starter}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 bg-primary/5">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                      ) : (
                        <span className="text-sm font-medium text-primary">{row.professional}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                      ) : (
                        <span className="text-sm">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {[
              { icon: Shield, label: 'SOC 2 Compliant' },
              { icon: Clock, label: '99.9% Uptime SLA' },
              { icon: Users, label: '1,200+ Companies' },
              { icon: Container, label: '95% Carrier Coverage' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <badge.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our pricing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to streamline your
              <span className="gradient-text"> freight operations?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary text-white px-8 h-14 text-lg glow-cyan" asChild>
                <Link to="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 text-lg" asChild>
                <Link to="/contact">
                  <Phone className="mr-2 h-5 w-5" />
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer brand="flow247" />
    </div>
  );
}
