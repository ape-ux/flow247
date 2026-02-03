-- ============================================
-- Fix RLS Policies for Profiles Table
-- Allow users to manage their own profile
-- Allow super admins to manage all profiles
-- ============================================
-- First, enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
-- ============================================
-- SELECT Policies
-- ============================================
-- All authenticated users can view all profiles (needed for team features)
CREATE POLICY "Authenticated users can view all profiles" ON profiles FOR
SELECT TO authenticated USING (true);
-- ============================================
-- INSERT Policies
-- ============================================
-- Users can create their own profile (id must match auth.uid())
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT TO authenticated WITH CHECK (auth.uid() = id);
-- Super admins can create any profile
CREATE POLICY "Super admins can insert any profile" ON profiles FOR
INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND is_super_admin = true
        )
        OR -- Also allow if the user's email is in the admin list
        auth.jwt()->>'email' IN ('ape@apeglobal.io', 'flavio.c@amassgroup.com')
    );
-- ============================================
-- UPDATE Policies
-- ============================================
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Super admins can update any profile
CREATE POLICY "Super admins can update any profile" ON profiles FOR
UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND is_super_admin = true
        )
        OR auth.jwt()->>'email' IN ('ape@apeglobal.io', 'flavio.c@amassgroup.com')
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND is_super_admin = true
        )
        OR auth.jwt()->>'email' IN ('ape@apeglobal.io', 'flavio.c@amassgroup.com')
    );
-- ============================================
-- DELETE Policies
-- ============================================
-- Only super admins can delete profiles
CREATE POLICY "Super admins can delete profiles" ON profiles FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND is_super_admin = true
    )
    OR auth.jwt()->>'email' IN ('ape@apeglobal.io', 'flavio.c@amassgroup.com')
);
-- ============================================
-- Service Role Bypass (for server-side operations)
-- ============================================
-- Note: The service role automatically bypasses RLS
-- ============================================
-- Create profile trigger for new auth users
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at
    )
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name'
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
        ),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ============================================
-- Ensure current admin user has is_super_admin flag
-- ============================================
UPDATE profiles
SET is_super_admin = true
WHERE email IN ('ape@apeglobal.io', 'flavio.c@amassgroup.com');