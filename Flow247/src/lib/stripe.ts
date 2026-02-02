// Stripe Configuration and Utilities for Flow247
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Lazy-loaded Stripe.js instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key || key === 'pk_test_placeholder') {
      console.warn('[Flow247] Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Stripe price ID configuration (replace with real IDs from Stripe Dashboard)
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  prices: {
    starter: {
      monthly: 'price_starter_monthly',
      annually: 'price_starter_annually',
    },
    professional: {
      monthly: 'price_professional_monthly',
      annually: 'price_professional_annually',
    },
    enterprise: {
      monthly: 'price_enterprise_monthly',
      annually: 'price_enterprise_annually',
    },
  },
  products: {
    starter: 'prod_starter',
    professional: 'prod_professional',
    enterprise: 'prod_enterprise',
  },
};

// Plan details for display
export const PLANS = {
  free: {
    name: 'Free',
    description: 'Basic access to explore the platform',
    monthlyPrice: 0,
    annualPrice: 0,
    features: ['View dashboard', 'Basic analytics'],
  },
  starter: {
    name: 'Starter',
    description: 'Perfect for small freight brokers getting started',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      'Up to 50 shipments/month',
      '2 team members',
      'Basic container tracking',
      'Email support',
      'Standard reports',
      'AI Chat Assistant',
    ],
  },
  professional: {
    name: 'Professional',
    description: 'For growing logistics companies with advanced needs',
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      'Up to 500 shipments/month',
      '10 team members',
      'Real-time container tracking',
      'Priority email & chat support',
      'Advanced analytics & reports',
      'AI Chat + 4 AI Agents',
      'LFD monitoring & alerts',
      'API access (10k calls/mo)',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Full-scale solution for large freight operations',
    monthlyPrice: 499,
    annualPrice: 399,
    features: [
      'Unlimited shipments',
      'Unlimited team members',
      'Real-time + predictive tracking',
      '24/7 phone & priority support',
      'Custom dashboards & reports',
      'All 8 AI Agents',
      'Advanced LFD + detention alerts',
      'Unlimited API access',
      'Custom integrations & webhooks',
      'Dedicated account manager',
    ],
  },
};

// Types
export interface CreateCheckoutSessionParams {
  priceId: string;
  planId: string;
  billingCycle: 'monthly' | 'annually';
}

/**
 * Create a Stripe Checkout Session via Supabase Edge Function.
 * Requires the user to be authenticated.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url: string }> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('You must be signed in to subscribe');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Checkout failed' }));
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Create a Stripe Customer Portal session via Supabase Edge Function.
 * Allows users to manage their subscription, payment methods, and invoices.
 */
export async function createPortalSession(): Promise<{ url: string }> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('You must be signed in');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Portal unavailable' }));
    throw new Error(error.message || 'Failed to create portal session');
  }

  return response.json();
}

/**
 * Read subscription status directly from Supabase subscriptions table.
 */
export async function getSubscriptionFromSupabase(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    user_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan_id: string;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
  };
}
