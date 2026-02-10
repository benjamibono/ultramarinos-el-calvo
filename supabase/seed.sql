-- ============================================================
-- Ultramarinos El Calvo - CMS Tables
-- Run this in Supabase SQL Editor to create tables + seed data
-- ============================================================

-- 1. BAR MENU ITEMS
-- ============================================================
CREATE TABLE bar_menu_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name_es text NOT NULL,
  name_en text NOT NULL,
  category text NOT NULL DEFAULT 'main' CHECK (category IN ('main', 'molletes')),
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE bar_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON bar_menu_items
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON bar_menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. TABLE MENU SECTIONS
-- ============================================================
CREATE TABLE table_menu_sections (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_es text NOT NULL,
  title_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE table_menu_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON table_menu_sections
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON table_menu_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. TABLE MENU ITEMS
-- ============================================================
CREATE TABLE table_menu_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section_id bigint NOT NULL REFERENCES table_menu_sections(id) ON DELETE CASCADE,
  name_es text NOT NULL,
  name_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE table_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON table_menu_items
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON table_menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. SCHEDULE
-- ============================================================
CREATE TABLE schedule (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  text_es text NOT NULL,
  text_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON schedule
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON schedule
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA
-- ============================================================

-- Bar menu: main items
INSERT INTO bar_menu_items (name_es, name_en, category, sort_order) VALUES
  ('GILDA DE ANCHOA', 'ANCHOVY GILDA', 'main', 1),
  ('HUEVAS DE CHOCO ALIÑÁS', 'SEASONED CUTTLEFISH ROE', 'main', 2),
  ('TOSTA DE ANCHOA Y MANTEQUILLA', 'ANCHOVY AND BUTTER TOAST', 'main', 3),
  ('MOJAMA CURADA EN CASA', 'HOUSE-CURED MOJAMA', 'main', 4),
  ('TOMATE "SUPER ALIÑAO"', 'SUPER SEASONED TOMATO', 'main', 5),
  ('ENSALADILLA DE...', 'RUSSIAN SALAD OF...', 'main', 6),
  ('PIRIÑACA Y TÚNIDO CURADO', 'PIRIÑACA AND CURED TUNA', 'main', 7),
  ('CROQUETA DE JAMÓN "JOSELITO" (1 UD)', 'JOSELITO HAM CROQUETTE (1 PC)', 'main', 8),
  ('CHICHARRONES ESPECIALES', 'SPECIAL PORK RINDS', 'main', 9),
  ('CHICHARRONES FRITOS', 'FRIED PORK RINDS', 'main', 10),
  ('ATÚN MECHAO', 'SHREDDED TUNA', 'main', 11),
  ('LOMO EN MANTECA DE CASA', 'HOUSE LOIN IN LARD', 'main', 12),
  ('COPPA "JOSELITO" (150 GR)', 'JOSELITO COPPA (150 GR)', 'main', 13),
  ('CHORIZO PICANTITO "LYO"', 'SPICY LYO CHORIZO', 'main', 14),
  ('PICANA DE BUEY 18 MESES "LYO" (100 GR)', '18 MONTHS LYO OX PICANHA (100 GR)', 'main', 15),
  ('CECINA DE VACA "LYO" (100 GR)', 'LYO BEEF CECINA (100 GR)', 'main', 16),
  ('QUESO AZUL DE CABRA FLORIDA "BUCARITO"', 'BUCARITO FLORIDA GOAT BLUE CHEESE', 'main', 17),
  ('QUESO DE LECHE CRUDA (150 GR)', 'RAW MILK CHEESE (150 GR)', 'main', 18),
  ('QUESO "EL BOSQUEÑO" CURADO EN OLOROSO', 'EL BOSQUEÑO CHEESE AGED IN OLOROSO', 'main', 19);

-- Bar menu: molletes
INSERT INTO bar_menu_items (name_es, name_en, category, sort_order) VALUES
  ('COPPA JOSELITO, TOMATE Y AOVE', 'JOSELITO COPPA, TOMATO AND EVOO', 'molletes', 1),
  ('PALOMETA Y QUESO AZUL DE CABRA', 'POMFRET AND GOAT BLUE CHEESE', 'molletes', 2),
  ('LOMO EN MANTECA, PIMIENTOS ASADOS', 'LOIN IN LARD, ROASTED PEPPERS', 'molletes', 3),
  ('CHICHARRONES, QUESO PAYOYO Y LIMA', 'PORK RINDS, PAYOYO CHEESE AND LIME', 'molletes', 4),
  ('PRINGÁ DE BERZA "GITANA"', 'GITANA STEW MEAT', 'molletes', 5),
  ('SERRANITO IBÉRICO', 'IBERIAN SERRANITO', 'molletes', 6);

-- Table menu sections
INSERT INTO table_menu_sections (title_es, title_en, sort_order) VALUES
  ('PA'' IR PICANDO...', 'TO START SNACKING...', 1),
  ('QUE NO SE PIERDAN LOS GUISOS...', 'DON''T MISS THE STEWS...', 2),
  ('PRODUCTO Y ESENCIA...', 'PRODUCT AND ESSENCE...', 3),
  ('GUARNICIONES ECOLÓGICAS', 'ORGANIC SIDES', 4),
  ('PA TERMINÁ...', 'TO FINISH...', 5);

-- Table menu items (section 1: PA' IR PICANDO)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (1, 'ENSALADILLA DE ...', 'RUSSIAN SALAD OF...', 1),
  (1, 'HUEVAS DE CHOCO ALIÑÁS', 'SEASONED CUTTLEFISH ROE', 2),
  (1, 'PIRIÑACA Y CABALLA SEMICURADA', 'PIRIÑACA AND SEMI-CURED MACKEREL', 3),
  (1, 'TOMATE ECOLÓGICO Y ACEITE DE AJO', 'ORGANIC TOMATO AND GARLIC OIL', 4),
  (1, 'ALCAUCILES, CREMA DE YEMA Y PAYOYO', 'ARTICHOKES, EGG YOLK CREAM AND PAYOYO', 5),
  (1, 'CROQUETAS DE JAMÓN JOSELITO (1 UD)', 'JOSELITO HAM CROQUETTES (1 PC)', 6),
  (1, 'SETAS SALTEADAS Y PARMENTIER', 'SAUTÉED MUSHROOMS AND PARMENTIER', 7);

-- Table menu items (section 2: GUISOS)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (2, 'CARRILLADA AL AMONTILLADO', 'AMONTILLADO BRAISED PORK CHEEKS', 1),
  (2, 'ALBÓNDIGAS DE VACA RETINTA', 'RETINTA BEEF MEATBALLS', 2),
  (2, 'SETAS AL AJILLO', 'GARLIC MUSHROOMS', 3),
  (2, 'CHOCO EN SU TINTA', 'INKED CUTTLEFISH', 4),
  (2, 'GAMBONES AL AJILLO', 'GARLIC PRAWNS', 5),
  (2, 'GUISO DEL DÍA', 'STEW OF THE DAY', 6);

-- Table menu items (section 3: PRODUCTO Y ESENCIA)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (3, 'LOMO ALTO "LYO" 120 DÍAS MADURACIÓN', 'HIGH LOIN "LYO" 120 DAYS AGED', 1),
  (3, 'LOMO BAJO SELECCIÓN "LYO" 90', 'LOW LOIN "LYO" SELECTION 90', 2),
  (3, 'PICAÑA DE BUEY SELECCIÓN', 'OX PICANHA SELECTION', 3),
  (3, 'CALAMARES DE POTERA A LA PLANCHA', 'GRILLED POLE-CAUGHT SQUID', 4),
  (3, 'CALAMARES DE POTERA FRITOS', 'FRIED POLE-CAUGHT SQUID', 5),
  (3, 'BARRIGA DE ATÚN "GADIRA" AL ENCEBOLLADO', '"GADIRA" TUNA BELLY WITH ONIONS', 6),
  (3, 'POLLO A LA PLANCHA AL AJILLO', 'GRILLED CHICKEN WITH GARLIC', 7);

-- Table menu items (section 4: GUARNICIONES)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (4, 'PAPAS FRITAS', 'FRENCH FRIES', 1),
  (4, 'PIMIENTOS ASADOS AL CARBÓN', 'CHARCOAL ROASTED PEPPERS', 2),
  (4, 'PIMIENTOS DE PADRÓN FRITOS', 'FRIED PADRÓN PEPPERS', 3),
  (4, 'ENSALADA DE LECHUGA ALIÑÁ', 'DRESSED LETTUCE SALAD', 4);

-- Table menu items (section 5: PA TERMINÁ)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (5, 'ARROZ CON LECHE', 'RICE PUDDING', 1),
  (5, 'TORRIJA Y HELADO DE LECHE MERENGADA', 'FRENCH TOAST AND MERINGUE MILK ICE CREAM', 2),
  (5, 'TARTA DE QUESO', 'CHEESECAKE', 3);

-- Schedule
INSERT INTO schedule (text_es, text_en, sort_order) VALUES
  ('Martes a Sábado:', 'Tuesday to Saturday:', 1),
  ('12:00 - 16:00 / 21:00 - 23:30', '12:00 - 16:00 / 21:00 - 23:30', 2),
  ('Domingo y Lunes: Cerrado', 'Sunday and Monday: Closed', 3);
