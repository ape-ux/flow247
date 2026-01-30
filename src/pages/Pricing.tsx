import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Sparkles, Zap, Building2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: 25,
    description: 'Ideal for independent freight brokers, small agencies, and owner-operators.',
    idealFor: 'Independent freight brokers, small agencies, owner-operators',
    features: [
      'Up to 100 shipments/month',
      '2 user seats',
      'Basic carrier rate lookups',
      '3 carrier integrations',
      'Quote generator with standard templates',
      'Shipment tracking dashboard',
      'Email support (48hr response)',
      'Basic reporting (monthly summaries)',
    ],
    popular: false,
    priceId: 'price_starter_25',
  },
  {
    name: 'Professional',
    icon: Sparkles,
    price: 99,
    description: 'Perfect for growing freight brokerages and regional logistics companies.',
    idealFor: 'Growing freight brokerages, regional logistics companies',
    features: [
      'Everything in Starter, plus:',
      'Up to 500 shipments/month',
      '10 user seats',
      'Full carrier API integrations (TQL, STG, TAI Cloud)',
      'AI-powered rate optimization & lane analysis',
      'Custom quote templates with branding',
      'CFS fee calculator & accessorial management',
      'Gross profit tracking by lane/client',
      'Customer portal for shipper visibility',
      'Priority support (24hr response)',
      'Advanced analytics & margin reports',
    ],
    popular: true,
    priceId: 'price_professional_99',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: null,
    priceLabel: 'Custom',
    description: 'Built for multi-location operations, 3PLs, and large freight forwarders.',
    idealFor: 'Multi-location operations, 3PLs, large freight forwarders',
    features: [
      'Everything in Professional, plus:',
      'Unlimited shipments',
      'Unlimited users',
      'Multi-location support (NYC, LAX, etc.)',
      'Dedicated API access for custom integrations',
      'White-label customer portal',
      'Commission tracking & agent payouts',
      'Automated document generation (BOL, POD)',
      'Dedicated account manager',
      'Custom onboarding & training',
      'SLA-backed uptime guarantee',
      'SSO & advanced security features',
    ],
    popular: false,
    priceId: 'price_enterprise_custom',
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string, isCustom: boolean = false) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe to a plan.',
      });
      return;
    }

    setLoading(priceId);
    
    try {
      if (isCustom) {
        // Enterprise plan - open mailto for custom pricing
        window.open('mailto:sales@apeglobal.com?subject=Enterprise Plan Inquiry&body=Hi, I\'m interested in the Enterprise plan. Please contact me to discuss custom pricing.', '_blank');
        toast({
          title: 'Contact Request Sent',
          description: 'Our sales team will reach out to you shortly to discuss Enterprise pricing.',
        });
        setLoading(null);
        return;
      }

      // Stripe Checkout integration
      // TODO: Replace with your Stripe publishable key
      const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE'; // Get from Stripe Dashboard
      
      // Create checkout session
      const response = await fetch('https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          planName: planName,
          // Add user info from auth context
          customerEmail: localStorage.getItem('userEmail') || '',
          successUrl: `${window.location.origin}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = (window as any).Stripe(STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              Pricing
            </span>
            <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Choose the plan that best fits your shipping needs. 
              All plans include our core features with no hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card relative flex flex-col p-8 transition-all hover:border-primary/50 ${
                  plan.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.price ? (
                    <>
                      <span className="font-display text-5xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="font-display text-5xl font-bold">{plan.priceLabel}</span>
                      <span className="text-muted-foreground block text-sm mt-2">Contact for pricing</span>
                    </>
                  )}
                </div>

                {(plan as any).idealFor && (
                  <div className="mb-4 rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Ideal for:</strong> {(plan as any).idealFor}
                    </p>
                  </div>
                )}

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className={feature.includes('Everything in') ? 'font-semibold' : ''}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'hero' : 'glass'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSubscribe(plan.priceId, plan.name, plan.price === null)}
                  disabled={loading === plan.priceId}
                >
                  {loading === plan.priceId 
                    ? 'Processing...' 
                    : plan.price === null 
                      ? 'Contact Sales' 
                      : 'Get Started'}
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ / Additional Info */}
          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="text-muted-foreground">
              All plans come with a 14-day free trial. No credit card required to start.
              Need a custom solution?{' '}
              <a href="mailto:info@apeglobal.io" className="text-primary hover:underline">
                Contact our sales team
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
