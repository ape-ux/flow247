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
    price: 49,
    description: 'Perfect for small businesses getting started with global shipping.',
    features: [
      'Up to 100 shipments/month',
      'Basic tracking & notifications',
      'Email support',
      'Standard analytics',
      'Single user account',
    ],
    popular: false,
    priceId: 'price_starter',
  },
  {
    name: 'Professional',
    icon: Sparkles,
    price: 149,
    description: 'Ideal for growing businesses with increasing shipping needs.',
    features: [
      'Up to 500 shipments/month',
      'Advanced tracking & real-time updates',
      'Priority email & chat support',
      'AI-powered analytics',
      'Up to 5 team members',
      'Custom integrations',
      'API access',
    ],
    popular: true,
    priceId: 'price_professional',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 499,
    description: 'For large organizations with complex logistics requirements.',
    features: [
      'Unlimited shipments',
      'White-glove tracking & support',
      'Dedicated account manager',
      'Advanced AI analytics & predictions',
      'Unlimited team members',
      'Custom workflows & automations',
      'Full API access & webhooks',
      'SLA guarantee',
    ],
    popular: false,
    priceId: 'price_enterprise',
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe to a plan.',
      });
      return;
    }

    setLoading(priceId);
    
    try {
      // This will be connected to Stripe via your backend
      toast({
        title: 'Coming soon!',
        description: `${planName} plan subscription will be available once Stripe is configured.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate subscription.',
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
                  <span className="font-display text-5xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'hero' : 'glass'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loading === plan.priceId}
                >
                  {loading === plan.priceId ? 'Processing...' : 'Get Started'}
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
