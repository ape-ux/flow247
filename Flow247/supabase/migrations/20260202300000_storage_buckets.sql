-- ============================================================
-- Storage Buckets: Documents & Avatars
-- Phase 1 from Flow247 implementation plan
-- ============================================================

-- Create storage buckets (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('documents', 'documents', false, 52428800, -- 50MB
   ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/vnd.ms-excel', 'text/csv']),
  ('avatars', 'avatars', true, 5242880, -- 5MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Documents bucket policies (private per user)
-- ============================================================

-- Users upload docs into their own folder: documents/{user_id}/...
DROP POLICY IF EXISTS "Users upload own docs" ON storage.objects;
CREATE POLICY "Users upload own docs" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users read their own docs
DROP POLICY IF EXISTS "Users read own docs" ON storage.objects;
CREATE POLICY "Users read own docs" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own docs
DROP POLICY IF EXISTS "Users delete own docs" ON storage.objects;
CREATE POLICY "Users delete own docs" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role full access to documents
DROP POLICY IF EXISTS "Service role documents access" ON storage.objects;
CREATE POLICY "Service role documents access" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'service_role'
  );

-- ============================================================
-- Avatars bucket policies (public read, owner write)
-- ============================================================

-- Public read for avatars
DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
CREATE POLICY "Public avatar read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Users upload avatars into their own folder: avatars/{user_id}/...
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users update their own avatar
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users delete their own avatar
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
