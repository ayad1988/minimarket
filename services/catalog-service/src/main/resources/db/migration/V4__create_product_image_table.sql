CREATE TABLE product_image (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_product_image_product
    FOREIGN KEY (product_id) REFERENCES product(id)
    ON DELETE CASCADE
);

CREATE INDEX ix_product_image_product_id ON product_image(product_id);
CREATE UNIQUE INDEX ux_product_image_product_pos ON product_image(product_id, position);
