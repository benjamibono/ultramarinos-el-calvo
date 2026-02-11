-- ============================================================
-- Add bar_menu_sections table for editable section titles
-- Run this in Supabase SQL Editor
-- ============================================================

BEGIN;

CREATE TABLE bar_menu_sections (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_es text NOT NULL,
  title_en text NOT NULL,
  category text NOT NULL UNIQUE CHECK (category IN ('main', 'molletes')),
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE bar_menu_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON bar_menu_sections
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON bar_menu_sections
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated update" ON bar_menu_sections
  FOR UPDATE USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON bar_menu_sections
  FOR DELETE USING ((select auth.role()) = 'authenticated');

-- Seed with current titles
INSERT INTO bar_menu_sections (title_es, title_en, category, sort_order) VALUES
  ('PLATOS PRINCIPALES', 'MAIN DISHES', 'main', 1),
  ('MOLLETES', 'SOFT ROLLS', 'molletes', 2);

COMMIT;
