import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Zap, Crown, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PLANS, createPortalSession, getSubscriptionFromSupabase } from '@/lib/stripe';

type SubscriptionData = {
  plan_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
} | null;

const planCards = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small freight brokers',
    icon: Zap,
    features: PLANS.starter.features,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For growing logistics operations',
    icon: Crown,
    features: PLANS.professional.features,
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$499',
    period: '/month',
    description: 'For large-scale operations',
    icon: Sparkles,
    features: PLANS.enterprise.features,
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData>(null);

  // Handle success redirect from Stripe Checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Welcome aboard.');
      // Refresh subscription data after a short delay (webhook might still be processing)
      setTimeout(() => loadSubscription(), 2000);
    }
  }, [searchParams]);

  const loadSubscription = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getSubscriptionFromSupabase(user.id);
      setSubscription(data);
    } catch {
      // No subscription found
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubscription(); }, [user]);

  const currentPlanId = subscription?.plan_id || 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const currentPlanName = (PLANS as any)[currentPlanId]?.name || 'Free';

  const handleManagePayment = async () => {
    setPortalLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground">Manage your plan and invoices</p>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="glass-card rounded-xl p-6 border-primary/30 animate-slide-up">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  Current Plan: <span className="gradient-text">{currentPlanName}</span>
                </h2>
                {isActive ? (
                  <Badge variant="glow">Active</Badge>
                ) : subscription?.status === 'past_due' ? (
                  <Badge variant="destructive">Past Due</Badge>
                ) : subscription?.status === 'canceled' ? (
                  <Badge variant="secondary">Canceled</Badge>
                ) : (
                  <Badge variant="outline">No Plan</Badge>
                )}
              </div>
              {subscription?.current_period_end && isActive && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {subscription.cancel_at_period_end
                    ? `Cancels on ${formatDate(subscription.current_period_end)}`
                    : `Next billing date: ${formatDate(subscription.current_period_end)}`
                  }
                </p>
              )}
              {!subscription && (
                <p className="mt-1 text-sm text-muted-foreground">
                  You are on the free tier. Upgrade to unlock all features.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {subscription?.stripe_customer_id ? (
                <Button variant="outline" onClick={handleManagePayment} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  Manage Billing
                </Button>
              ) : (
                <Button className="gradient-primary glow-cyan" onClick={() => navigate('/pricing')}>
                  Choose a Plan
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {planCards.map((plan, i) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`glass-card relative overflow-hidden rounded-xl p-6 animate-slide-up ${
                  plan.highlighted ? 'border-primary/50 glow-cyan' : ''
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.highlighted && (
                  <div className="absolute right-0 top-0 gradient-primary px-4 py-1 text-xs font-semibold text-white rounded-bl-xl">
                    Most Popular
                  </div>
                )}

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <plan.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

                <ul className="my-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.highlighted && !isCurrent ? 'gradient-primary glow-cyan' : ''}`}
                  variant={isCurrent ? 'outline' : plan.highlighted ? 'default' : 'secondary'}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && navigate('/pricing')}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice info */}
      <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <CreditCard className="h-5 w-5 text-primary" />
          Invoice History
        </h2>
        {subscription?.stripe_customer_id ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View and download your full invoice history in the Stripe Customer Portal.
            </p>
            <Button variant="outline" size="sm" onClick={handleManagePayment} disabled={portalLoading}>
              {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              View Invoices in Portal
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            No invoices yet. Subscribe to a plan to get started.
          </p>
        )}
      </div>
    </div>
  );
}
