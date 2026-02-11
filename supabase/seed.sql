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
  ('GILDA DE ANCHOA (1 UD)', 'ANCHOVY GILDA (1 PC)', 'main', 1),
  ('HUEVAS DE ATÚN CON SU MAYONESA', 'TUNA ROE WITH MAYONNAISE', 'main', 2),
  ('TOSTA DE ANCHOA 00 Y MANTEQUILLA (1 UD)', 'ANCHOVY 00 AND BUTTER TOAST (1 PC)', 'main', 3),
  ('MOJAMA CURADA EN CASA', 'HOUSE-CURED MOJAMA', 'main', 4),
  ('TOMATE "SUPER ALIÑAO"', 'SUPER SEASONED TOMATO', 'main', 5),
  ('ENSALADILLA DE CAMARONES', 'SHRIMP RUSSIAN SALAD', 'main', 6),
  ('CROQUETA DE JAMÓN "JOSELITO" (1 UD)', 'JOSELITO HAM CROQUETTE (1 PC)', 'main', 7),
  ('CHICHARRONES ESPECIALES', 'SPECIAL PORK RINDS', 'main', 8),
  ('CHICHARRONES FRITOS', 'FRIED PORK RINDS', 'main', 9),
  ('ATÚN MECHAO CON SU PAN EMPAPAO', 'SHREDDED TUNA WITH SOAKED BREAD', 'main', 10),
  ('LOMO EN MANTECA CASERO', 'HOMEMADE LOIN IN LARD', 'main', 11),
  ('CABECERA EMBUCHADA DE LOS PEDROCHES (150 GR)', 'LOS PEDROCHES CURED PORK LOIN (150 GR)', 'main', 12),
  ('CHORIZO PICANTITO "LYO"', 'SPICY LYO CHORIZO', 'main', 13),
  ('PICAÑA DE BUEY 18 MESES "LYO" (100 GR)', '18 MONTHS LYO OX PICANHA (100 GR)', 'main', 14),
  ('QUESO AZUL DE CABRA FLORIDA "BUCARITO"', 'BUCARITO FLORIDA GOAT BLUE CHEESE', 'main', 15),
  ('QUESO DE LECHE CRUDA 150 GR', 'RAW MILK CHEESE 150 GR', 'main', 16),
  ('QUESO "EL BOSQUEÑO" CURADO EN OLOROSO', 'EL BOSQUEÑO CHEESE AGED IN OLOROSO', 'main', 17),
  ('TABLA DE QUESOS "BUCARITO"', 'BUCARITO CHEESE BOARD', 'main', 18);

-- Bar menu: molletes
INSERT INTO bar_menu_items (name_es, name_en, category, sort_order) VALUES
  ('CARNE AL TORO DESH. Y QUESO AHUMADO', 'BULL-STYLE SHREDDED MEAT AND SMOKED CHEESE', 'molletes', 1),
  ('PALOMETA Y QUESO AZUL DE CABRA', 'POMFRET AND GOAT BLUE CHEESE', 'molletes', 2),
  ('ROPA VIEJA, PATATAS PAJAS Y EMULSIÓN DE HIERBABUENA', 'ROPA VIEJA, STRAW FRIES AND MINT EMULSION', 'molletes', 3),
  ('CHICHARRONES, QUESO PAYOYO Y LIMA', 'PORK RINDS, PAYOYO CHEESE AND LIME', 'molletes', 4),
  ('SOBRASADA, QUESO Y MIEL', 'SOBRASADA, CHEESE AND HONEY', 'molletes', 5),
  ('SERRANITO DE ATÚN DE ALMADRABA', 'ALMADRABA TUNA SERRANITO', 'molletes', 6);

-- Table menu sections
INSERT INTO table_menu_sections (title_es, title_en, sort_order) VALUES
  ('PA'' IR PICANDO...', 'TO START SNACKING...', 1),
  ('QUE NO SE PIERDAN LOS GUISOS...', 'DON''T MISS THE STEWS...', 2),
  ('PRODUCTO...', 'PRODUCT...', 3),
  ('GUARNICIONES ECOLÓGICAS...', 'ORGANIC SIDES...', 4),
  ('PA'' TERMINÁ...', 'TO FINISH...', 5);

-- Table menu items (section 1: PA' IR PICANDO)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (1, 'ENSALADILLA DE CAMARONES', 'SHRIMP RUSSIAN SALAD', 1),
  (1, 'HUEVAS DE ATÚN DE ALMADRABA', 'ALMADRABA TUNA ROE', 2),
  (1, 'PAPAS ALI-OLI BRAVEADAS', 'ALI-OLI BRAVAS POTATOES', 3),
  (1, 'FLOR DE ALCACHOFA FRITA, YEMA, TRUFA Y PAYOYO', 'FRIED ARTICHOKE FLOWER, EGG YOLK, TRUFFLE AND PAYOYO', 4),
  (1, 'TRIO DE TOMATES "SUPER ALIÑADO"', 'TRIO OF SUPER SEASONED TOMATOES', 5),
  (1, 'EMPANADA CRUJIENTE DE TORTILLA Y CHORIZO IB.', 'CRISPY TORTILLA AND IBERIAN CHORIZO EMPANADA', 6),
  (1, 'CROQUETAS DE JAMÓN JOSELITO (1 UD)', 'JOSELITO HAM CROQUETTES (1 PC)', 7),
  (1, 'GILDA DE ANCHOA', 'ANCHOVY GILDA', 8),
  (1, 'TABLA DE QUESOS SELECCIÓN', 'SELECTION CHEESE BOARD', 9);

-- Table menu items (section 2: GUISOS)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (2, 'CARRILLÁ AL PEDRO JIMÉNEZ', 'PEDRO XIMÉNEZ BRAISED PORK CHEEKS', 1),
  (2, 'ALBÓNDIGAS DE VACA RETINTA Y SETAS', 'RETINTA BEEF MEATBALLS WITH MUSHROOMS', 2),
  (2, 'CHIPIRÓN RELLENO EN SALSA DE MARISCO', 'STUFFED BABY SQUID IN SEAFOOD SAUCE', 3),
  (2, 'BACALAO AL PIL-PIL DE SALICORNIA Y GUISANTES', 'COD PIL-PIL WITH SAMPHIRE AND PEAS', 4),
  (2, 'PARPATANA DE ATÚN DE ALMADRABA CON GUISO DE ALMENDRAS FRITAS', 'ALMADRABA TUNA JAW WITH FRIED ALMOND STEW', 5);

-- Table menu items (section 3: PRODUCTO)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (3, 'GAMBONES AL AJILLO', 'GARLIC KING PRAWNS', 1),
  (3, 'CHOCO DE P. REAL FRITO CON ALI-OLI DE TINTA', 'PUERTO REAL FRIED CUTTLEFISH WITH INK ALI-OLI', 2),
  (3, 'CALAMARES PLANCHADO, CREMA IBÉRICA Y CRUJIENTE DE JAMÓN', 'GRILLED SQUID, IBERIAN CREAM AND HAM CRISP', 3),
  (3, 'BARRIGA DE ATÚN "GADIRA" Y CREMA DE TOMATE SECO', 'GADIRA TUNA BELLY WITH SUN-DRIED TOMATO CREAM', 4),
  (3, 'LAGARTITO 100% IBÉRICO, A LA PLANCHA', '100% IBERIAN LAGARTITO, GRILLED', 5),
  (3, 'PICAÑA DE BUEY CURADA Y MADURADA (LYO)', 'CURED AND AGED OX PICANHA (LYO)', 6),
  (3, 'LOMO BAJO DE VACA DE ALDEA (LYO) 60 DÍAS MAD', 'VILLAGE BEEF LOW LOIN (LYO) 60 DAYS AGED', 7),
  (3, 'CALVO BURGUER… CARNE DE CHULETA LYO, QUESO AHUMADO, S.EMMY CASERA Y SUS PATATAS', 'CALVO BURGER… LYO RIB MEAT, SMOKED CHEESE, HOMEMADE S.EMMY SAUCE AND FRIES', 8);

-- Table menu items (section 4: GUARNICIONES)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (4, 'PAPAS FRITAS', 'FRENCH FRIES', 1),
  (4, 'PIMIENTOS DEL PIQUILLO Y PIL-PIL DE SU JUGO', 'PIQUILLO PEPPERS WITH PIL-PIL SAUCE', 2),
  (4, 'PIMIENTOS DE PADRÓN FRITOS', 'FRIED PADRÓN PEPPERS', 3);

-- Table menu items (section 5: PA' TERMINÁ)
INSERT INTO table_menu_items (section_id, name_es, name_en, sort_order) VALUES
  (5, 'BROWNIE Y CREMA INGLESA DE PINO', 'BROWNIE WITH PINE NUT ENGLISH CREAM', 1),
  (5, 'TARTA DE QUESO', 'CHEESECAKE', 2),
  (5, 'TARTA CREMOSA DE CHOCOLATE', 'CREAMY CHOCOLATE CAKE', 3);

-- Schedule
INSERT INTO schedule (text_es, text_en, sort_order) VALUES
  ('Martes a Sábado:', 'Tuesday to Saturday:', 1),
  ('12:00 - 16:00 / 21:00 - 23:30', '12:00 - 16:00 / 21:00 - 23:30', 2),
  ('Domingo y Lunes: Cerrado', 'Sunday and Monday: Closed', 3);
