-- 1) Ajouter les colonnes SANS contraintes bloquantes
ALTER TABLE product
  ADD COLUMN sku VARCHAR(64),
  ADD COLUMN brand VARCHAR(120),
  ADD COLUMN model VARCHAR(120),
  ADD COLUMN category VARCHAR(60),
  ADD COLUMN description TEXT,
  ADD COLUMN main_image_url TEXT,
  ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2) Backfill pour les lignes existantes (issues de V2)
-- sku: on génère quelque chose de stable à partir de l'id
UPDATE product
SET sku = CONCAT('SKU-', REPLACE(CAST(id AS TEXT), '-', ''))
WHERE sku IS NULL;

-- category: valeur par défaut pour l'existant
UPDATE product
SET category = 'ELECTRONICS'
WHERE category IS NULL;

-- 3) Appliquer les contraintes une fois que toutes les lignes sont remplies
ALTER TABLE product
  ALTER COLUMN sku SET NOT NULL,
  ALTER COLUMN category SET NOT NULL;

-- 4) Indexes
CREATE UNIQUE INDEX ux_product_sku ON product (sku);
CREATE INDEX ix_product_category ON product (category);
CREATE INDEX ix_product_active ON product (active);
