-- ============================================================
-- Replicate Xano Stripe tables into Supabase
-- Source: Xano Workspace 1 (Freight Flow Ai)
-- Tables: subscription_plan, subscription (alter), api_rate_limit, booking_payments
-- ============================================================

-- ============================================================
-- 1. subscription_plan — Defines available plans & Stripe price IDs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_plan (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL DEFAULT '',
  stripe_price_id TEXT NOT NULL DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_annual DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_plan_stripe_price_id
  ON public.subscription_plan(stripe_price_id) WHERE stripe_price_id != '';

CREATE INDEX IF NOT EXISTS idx_subscription_plan_is_active
  ON public.subscription_plan(is_active);

-- RLS
ALTER TABLE public.subscription_plan ENABLE ROW LEVEL SECURITY;

-- Everyone can read active plans (public pricing page)
CREATE POLICY "Anyone can read active plans"
  ON public.subscription_plan FOR SELECT
  USING (is_active = true);

-- Service role full access
CREATE POLICY "Service role manages plans"
  ON public.subscription_plan FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 2. Alter existing subscriptions table to match Xano schema
--    Adds: tenant_id, cancelled_at; ensures plan_id works with subscription_plan
-- ============================================================
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- ============================================================
-- 3. api_rate_limit — Rate limits per subscription plan
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_rate_limit (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL DEFAULT '',
  subscription_plan_id INT REFERENCES public.subscription_plan(id) ON DELETE SET NULL,
  requests_per_minute INT NOT NULL DEFAULT 0,
  requests_per_hour INT NOT NULL DEFAULT 0,
  requests_per_day INT NOT NULL DEFAULT 0,
  requests_per_month INT NOT NULL DEFAULT 0,
  max_concurrent_requests INT NOT NULL DEFAULT 0,
  providers_allowed JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limit_plan
  ON public.api_rate_limit(subscription_plan_id);

-- RLS
ALTER TABLE public.api_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read rate limits"
  ON public.api_rate_limit FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages rate limits"
  ON public.api_rate_limit FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 4. booking_payments — Stripe payment tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.booking_payments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  booking_id INT,
  stripe_payment_intent_id TEXT DEFAULT '',
  stripe_charge_id TEXT DEFAULT '',
  stripe_refund_id TEXT DEFAULT '',
  stripe_customer_id TEXT DEFAULT '',
  amount DECIMAL(12,2) DEFAULT 0,
  amount_captured DECIMAL(12,2) DEFAULT 0,
  amount_refunded DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  stripe_fee DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','SUCCEEDED','FAILED','CANCELED','REFUNDED','PARTIALLY_REFUNDED')),
  payment_method TEXT DEFAULT '',
  payment_method_type TEXT DEFAULT '',
  payment_method_last4 TEXT DEFAULT '',
  billing_name TEXT DEFAULT '',
  billing_email TEXT DEFAULT '',
  billing_phone TEXT DEFAULT '',
  billing_address JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  authorized_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  failure_code TEXT DEFAULT '',
  failure_message TEXT DEFAULT '',
  refund_reason TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  receipt_url TEXT DEFAULT '',
  risk_score INT DEFAULT 0,
  risk_level TEXT DEFAULT '',
  is_disputed BOOLEAN DEFAULT false,
  dispute_id TEXT DEFAULT '',
  tenant_id UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_payments_stripe_pi
  ON public.booking_payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id != '';

CREATE INDEX IF NOT EXISTS idx_booking_payments_status
  ON public.booking_payments(status);

CREATE INDEX IF NOT EXISTS idx_booking_payments_booking
  ON public.booking_payments(booking_id);

-- RLS
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages payments"
  ON public.booking_payments FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 5. Seed subscription_plan data from Xano
-- ============================================================
INSERT INTO public.subscription_plan (id, name, stripe_price_id, features, price_monthly, price_annual, is_active)
VALUES
  (1, 'Free', '', '["View dashboard", "Basic analytics"]'::jsonb, 0, 0, true),
  (2, 'Starter', 'price_1Sf6ap4Z50BH2Sx6ucws0cps',
   '["Up to 100 shipments/month", "2 user seats", "Basic carrier rate lookups", "3 carrier integrations", "Email support (48hr response)"]'::jsonb,
   25, 300, true),
  (3, 'Professional', 'price_1Sf5qo4Z50BH2Sx6B4B0u21K',
   '["Up to 500 shipments/month", "10 user seats", "Full carrier API integrations", "AI-powered rate optimization", "Priority support (24hr response)"]'::jsonb,
   99, 1188, true),
  (4, 'Enterprise', '',
   '["Unlimited shipments", "Unlimited users", "Multi-location support", "Dedicated API access", "Dedicated account manager"]'::jsonb,
   0, 0, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stripe_price_id = EXCLUDED.stripe_price_id,
  features = EXCLUDED.features,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  is_active = EXCLUDED.is_active;

-- Reset sequence
SELECT setval('subscription_plan_id_seq', 10, true);

-- ============================================================
-- 6. Seed api_rate_limit data (matching Xano plan tiers)
-- ============================================================
INSERT INTO public.api_rate_limit (name, subscription_plan_id, requests_per_minute, requests_per_hour, requests_per_day, requests_per_month, max_concurrent_requests, providers_allowed, features)
VALUES
  ('Free Tier', 1, 10, 100, 500, 5000, 1, '[]'::jsonb, '{"dashboard": true}'::jsonb),
  ('Starter Tier', 2, 30, 500, 5000, 50000, 3, '["basic"]'::jsonb, '{"dashboard": true, "tracking": true, "carrier_rates": true}'::jsonb),
  ('Professional Tier', 3, 60, 2000, 20000, 200000, 10, '["basic", "premium"]'::jsonb, '{"dashboard": true, "tracking": true, "carrier_rates": true, "ai_optimization": true, "api_access": true}'::jsonb),
  ('Enterprise Tier', 4, 120, 10000, 100000, 0, 50, '["basic", "premium", "dedicated"]'::jsonb, '{"dashboard": true, "tracking": true, "carrier_rates": true, "ai_optimization": true, "api_access": true, "dedicated_support": true, "custom_integrations": true}'::jsonb)
ON CONFLICT DO NOTHING;
