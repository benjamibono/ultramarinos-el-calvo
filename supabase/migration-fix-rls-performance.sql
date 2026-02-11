-- ============================================================
-- Fix RLS Performance Issues (Supabase Linter Warnings)
-- Run this in Supabase SQL Editor
-- ============================================================
-- Fixes:
--   1. auth_rls_initplan: wrap auth.role()/auth.uid() in (select ...)
--   2. multiple_permissive_policies: replace FOR ALL with specific actions
--   3. unindexed_foreign_keys: add index on table_menu_items.section_id
-- ============================================================

BEGIN;

-- ============================================================
-- 1. TABLES FROM seed.sql
--    Fix: "Allow authenticated write" uses FOR ALL (includes SELECT),
--    causing overlap with "Allow public read". Replace with specific
--    INSERT/UPDATE/DELETE policies using (select auth.role()).
-- ============================================================

-- bar_menu_items
DROP POLICY IF EXISTS "Allow authenticated write" ON bar_menu_items;
CREATE POLICY "Allow authenticated write" ON bar_menu_items
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated update" ON bar_menu_items
  FOR UPDATE
  USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON bar_menu_items
  FOR DELETE
  USING ((select auth.role()) = 'authenticated');

-- table_menu_sections
DROP POLICY IF EXISTS "Allow authenticated write" ON table_menu_sections;
CREATE POLICY "Allow authenticated write" ON table_menu_sections
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated update" ON table_menu_sections
  FOR UPDATE
  USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON table_menu_sections
  FOR DELETE
  USING ((select auth.role()) = 'authenticated');

-- table_menu_items
DROP POLICY IF EXISTS "Allow authenticated write" ON table_menu_items;
CREATE POLICY "Allow authenticated write" ON table_menu_items
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated update" ON table_menu_items
  FOR UPDATE
  USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON table_menu_items
  FOR DELETE
  USING ((select auth.role()) = 'authenticated');

-- schedule
DROP POLICY IF EXISTS "Allow authenticated write" ON schedule;
CREATE POLICY "Allow authenticated write" ON schedule
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated update" ON schedule
  FOR UPDATE
  USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON schedule
  FOR DELETE
  USING ((select auth.role()) = 'authenticated');

-- ============================================================
-- 2. site_settings
--    Fix auth_rls_initplan for auth_write_settings & auth_update_settings
-- ============================================================

DROP POLICY IF EXISTS "auth_write_settings" ON site_settings;
CREATE POLICY "auth_write_settings" ON site_settings
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "auth_update_settings" ON site_settings;
CREATE POLICY "auth_update_settings" ON site_settings
  FOR UPDATE
  USING ((select auth.role()) = 'authenticated');

-- ============================================================
-- 3. videos
--    Fix auth_rls_initplan for auth_insert, auth_delete, auth_update
-- ============================================================

DROP POLICY IF EXISTS "auth_insert" ON videos;
CREATE POLICY "auth_insert" ON videos
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "auth_delete" ON videos;
CREATE POLICY "auth_delete" ON videos
  FOR DELETE
  USING ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "auth_update" ON videos;
CREATE POLICY "auth_update" ON videos
  FOR UPDATE
  USING ((select auth.role()) = 'authenticated');

-- ============================================================
-- 4. video_events
--    Fix auth_rls_initplan for auth_insert_events, auth_read_events
-- ============================================================

DROP POLICY IF EXISTS "auth_insert_events" ON video_events;
CREATE POLICY "auth_insert_events" ON video_events
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "auth_read_events" ON video_events;
CREATE POLICY "auth_read_events" ON video_events
  FOR SELECT
  USING ((select auth.role()) = 'authenticated');

-- ============================================================
-- 5. Add missing index on table_menu_items.section_id (foreign key)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_table_menu_items_section_id
  ON table_menu_items (section_id);

COMMIT;
