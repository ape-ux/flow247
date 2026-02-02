-- ============================================================
-- Security Lockdown: Enable RLS on ALL tables + core policies
-- Phase 1 from Flow247 implementation plan
-- ============================================================

-- Ensure handle_updated_at function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. profiles — RLS + schema upgrade
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add columns if missing
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'shipper',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS xano_user_id INTEGER,
  ADD COLUMN IF NOT EXISTS account_id INTEGER,
  ADD COLUMN IF NOT EXISTS user_type TEXT,
  ADD COLUMN IF NOT EXISTS employee_role TEXT,
  ADD COLUMN IF NOT EXISTS user_role_v2 TEXT,
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS permissions JSONB,
  ADD COLUMN IF NOT EXISTS is_sales_agent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sales_agent_id INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_id INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS llm_api_key TEXT,
  ADD COLUMN IF NOT EXISTS llm_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS workflow_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS storage_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS google_id TEXT,
  ADD COLUMN IF NOT EXISTS google_oauth JSONB,
  ADD COLUMN IF NOT EXISTS invited_by INTEGER,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_ip TEXT,
  ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- RLS policies for profiles
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;
CREATE POLICY "Service role full access profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- updated_at trigger
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. quotes — RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

    ALTER TABLE public.quotes
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

    DROP POLICY IF EXISTS "Users read own quotes" ON public.quotes;
    CREATE POLICY "Users read own quotes" ON public.quotes
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users create own quotes" ON public.quotes;
    CREATE POLICY "Users create own quotes" ON public.quotes
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Service role full access quotes" ON public.quotes;
    CREATE POLICY "Service role full access quotes" ON public.quotes
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================
-- 3. shipments — RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shipments') THEN
    ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

    ALTER TABLE public.shipments
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

    DROP POLICY IF EXISTS "Users read own shipments" ON public.shipments;
    CREATE POLICY "Users read own shipments" ON public.shipments
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Service role full access shipments" ON public.shipments;
    CREATE POLICY "Service role full access shipments" ON public.shipments
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================
-- 4. documents — RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

    ALTER TABLE public.documents
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
      ADD COLUMN IF NOT EXISTS shipment_id TEXT;

    DROP POLICY IF EXISTS "Users read own documents" ON public.documents;
    CREATE POLICY "Users read own documents" ON public.documents
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Service role full access documents" ON public.documents;
    CREATE POLICY "Service role full access documents" ON public.documents
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================
-- 5. carriers — public read RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'carriers') THEN
    ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Carriers public read" ON public.carriers;
    CREATE POLICY "Carriers public read" ON public.carriers
      FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Service role full access carriers" ON public.carriers;
    CREATE POLICY "Service role full access carriers" ON public.carriers
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================
-- 6. rate_quotes — RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rate_quotes') THEN
    ALTER TABLE public.rate_quotes ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users read own rate_quotes" ON public.rate_quotes;
    CREATE POLICY "Users read own rate_quotes" ON public.rate_quotes
      FOR SELECT USING (auth.uid()::text = user_id::text);

    DROP POLICY IF EXISTS "Service role full access rate_quotes" ON public.rate_quotes;
    CREATE POLICY "Service role full access rate_quotes" ON public.rate_quotes
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================
-- 7. shipment_tracking — RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shipment_tracking') THEN
    ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;

    ALTER TABLE public.shipment_tracking
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
      ADD COLUMN IF NOT EXISTS shipment_id TEXT;

    DROP POLICY IF EXISTS "Users read own tracking" ON public.shipment_tracking;
    CREATE POLICY "Users read own tracking" ON public.shipment_tracking
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Service role full access tracking" ON public.shipment_tracking;
    CREATE POLICY "Service role full access tracking" ON public.shipment_tracking
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================
-- 8. user_preferences — RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users read own preferences" ON public.user_preferences;
    CREATE POLICY "Users read own preferences" ON public.user_preferences
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
    CREATE POLICY "Users manage own preferences" ON public.user_preferences
      FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Service role full access preferences" ON public.user_preferences;
    CREATE POLICY "Service role full access preferences" ON public.user_preferences
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_xano_user_id ON public.profiles(xano_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
