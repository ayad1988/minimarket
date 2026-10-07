-- Orders placed while signed in are linked to the Keycloak user (sub claim); guest orders keep NULL.
ALTER TABLE orders ADD COLUMN customer_id VARCHAR(64);
CREATE INDEX idx_orders_customer ON orders (customer_id, created_at DESC);
