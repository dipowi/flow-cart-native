
-- Add inventory control columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sold_out boolean NOT NULL DEFAULT false;
