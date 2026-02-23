
-- Add merchandising columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0;

-- Add random toggle to store_settings
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS is_homepage_random boolean NOT NULL DEFAULT false;

-- Index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_products_merchandising ON public.products (is_pinned DESC, order_index ASC);
