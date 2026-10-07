-- Catalog product ids are UUIDs, not numeric.
ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(64) USING product_id::text;
