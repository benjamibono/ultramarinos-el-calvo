-- ============================================================
-- Restrict every write to an explicit admin allowlist.
--
-- Why: the existing policies allow writes for auth.role() = 'authenticated'.
-- Email sign-up is enabled on this project, so anyone who registers and
-- confirms an address becomes "authenticated" and can edit the menu,
-- the schedule, site settings and the videos.
--
-- Run in the Supabase SQL editor AFTER:
--   1. Authentication > Providers > Email: turn OFF "Allow new users to sign up".
--   2. Authentication > Users: delete any account that is not yours.
-- Then replace the placeholder email below and run this file.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.admins (
  email text PRIMARY KEY
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;  -- no policies: invisible to anon/authenticated

INSERT INTO public.admins (email) VALUES ('REPLACE_WITH_ADMIN_EMAIL')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.email = lower((SELECT auth.jwt() ->> 'email'))
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Content tables: public read stays as is; writes become admin-only.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['bar_menu_items','bar_menu_sections','table_menu_sections','table_menu_items','schedule']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated write" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "admin insert" ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()))', t);
    EXECUTE format('CREATE POLICY "admin update" ON public.%I FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))', t);
    EXECUTE format('CREATE POLICY "admin delete" ON public.%I FOR DELETE TO authenticated USING ((SELECT public.is_admin()))', t);
  END LOOP;
END $$;

-- site_settings
DROP POLICY IF EXISTS "auth_write_settings" ON public.site_settings;
DROP POLICY IF EXISTS "auth_update_settings" ON public.site_settings;
CREATE POLICY "admin insert" ON public.site_settings FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "admin update" ON public.site_settings FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- videos
DROP POLICY IF EXISTS "auth_insert" ON public.videos;
DROP POLICY IF EXISTS "auth_delete" ON public.videos;
DROP POLICY IF EXISTS "auth_update" ON public.videos;
CREATE POLICY "admin insert" ON public.videos FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "admin update" ON public.videos FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "admin delete" ON public.videos FOR DELETE TO authenticated USING ((SELECT public.is_admin()));

-- video_events
DROP POLICY IF EXISTS "auth_insert_events" ON public.video_events;
DROP POLICY IF EXISTS "auth_read_events" ON public.video_events;
CREATE POLICY "admin insert" ON public.video_events FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "admin read" ON public.video_events FOR SELECT TO authenticated USING ((SELECT public.is_admin()));

-- Storage bucket "videos": public read via public URL, admin-only writes.
-- Review existing storage policies first: Storage > Policies. Drop any that allow
-- 'authenticated' to insert/update/delete on bucket 'videos', then:
CREATE POLICY "videos admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos' AND (SELECT public.is_admin()));
CREATE POLICY "videos admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'videos' AND (SELECT public.is_admin()));
CREATE POLICY "videos admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'videos' AND (SELECT public.is_admin()));

COMMIT;
