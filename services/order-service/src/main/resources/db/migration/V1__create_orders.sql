CREATE TABLE orders (
    id              UUID PRIMARY KEY,
    customer_email  VARCHAR(255)   NOT NULL,
    status          VARCHAR(32)    NOT NULL,
    total_amount    NUMERIC(12, 2) NOT NULL,
    created_at      TIMESTAMPTZ    NOT NULL
);

CREATE TABLE order_items (
    order_id    UUID           NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id  BIGINT         NOT NULL,
    quantity    INTEGER        NOT NULL,
    unit_price  NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items (order_id);
