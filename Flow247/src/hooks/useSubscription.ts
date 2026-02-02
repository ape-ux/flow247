// Subscription status hook — reads from Supabase subscriptions table
// and provides checkout/portal helpers via Stripe Edge Functions
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DEV_MODE } from '@/lib/supabase';
import {
  getSubscriptionFromSupabase,
  createCheckoutSession,
  createPortalSession,
  PLANS,
  STRIPE_CONFIG,
  type CreateCheckoutSessionParams,
} from '@/lib/stripe';
import { toast } from 'sonner';

export interface SubscriptionState {
  planId: string;
  planName: string;
  status: string;
  isActive: boolean;
  isTrial: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

const DEFAULT_STATE: SubscriptionState = {
  planId: 'free',
  planName: 'Free',
  status: 'inactive',
  isActive: false,
  isTrial: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
};

/**
 * Hook to manage subscription state + Stripe checkout/portal.
 *
 * @example
 * ```tsx
 * const { subscription, loading, subscribe, manageSubscription } = useSubscription();
 * ```
 */
export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load subscription from Supabase
  const loadSubscription = useCallback(async () => {
    if (DEV_MODE || !user) {
      setSubscription(DEFAULT_STATE);
      setLoading(false);
      return;
    }

    try {
      const data = await getSubscriptionFromSupabase(user.id);

      if (data) {
        const planKey = data.plan_id as keyof typeof PLANS;
        const plan = PLANS[planKey] || PLANS.free;
        const isActive = ['active', 'trialing'].includes(data.status);
        const isTrial = data.status === 'trialing' || (
          data.plan_id === 'free' &&
          data.current_period_end &&
          new Date(data.current_period_end) > new Date()
        );

        setSubscription({
          planId: data.plan_id,
          planName: plan.name,
          status: data.status,
          isActive,
          isTrial,
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
        });
      } else {
        setSubscription(DEFAULT_STATE);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription(DEFAULT_STATE);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Start Stripe Checkout for a plan
  const subscribe = useCallback(
    async (planKey: 'starter' | 'professional', billingCycle: 'monthly' | 'annually' = 'monthly') => {
      if (!user) {
        toast.error('You must be signed in to subscribe');
        return;
      }

      const priceId = STRIPE_CONFIG.prices[planKey]?.[billingCycle];
      if (!priceId) {
        toast.error('Invalid plan selected');
        return;
      }

      setActionLoading(true);
      try {
        const { url } = await createCheckoutSession({
          priceId,
          planId: planKey,
          billingCycle,
        });

        if (url) {
          window.location.href = url;
        } else {
          toast.error('Failed to create checkout session');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Checkout failed');
      } finally {
        setActionLoading(false);
      }
    },
    [user]
  );

  // Open Stripe Customer Portal
  const manageSubscription = useCallback(async () => {
    if (!user) {
      toast.error('You must be signed in');
      return;
    }

    setActionLoading(true);
    try {
      const { url } = await createPortalSession();
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Portal unavailable');
    } finally {
      setActionLoading(false);
    }
  }, [user]);

  return {
    subscription,
    loading,
    actionLoading,
    subscribe,
    manageSubscription,
    refreshSubscription: loadSubscription,
    plans: PLANS,
  };
}
