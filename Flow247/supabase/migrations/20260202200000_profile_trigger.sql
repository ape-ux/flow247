-- ============================================================
-- Profile Auto-Creation Trigger
-- Creates a profile row + subscription on Supabase auth signup
-- Phase 2 from Flow247 implementation plan
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    status,
    auth_provider,
    onboarded,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    'shipper',
    'active',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    FALSE,
    NOW(),
    NOW()
  );

  -- Auto-create free subscription (14-day trial)
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '14 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
