
-- Add header configuration columns to store_settings
ALTER TABLE public.store_settings 
  ADD COLUMN IF NOT EXISTS store_name text NOT NULL DEFAULT 'Toko Cokotq',
  ADD COLUMN IF NOT EXISTS store_description text NOT NULL DEFAULT 'Belanja mudah, harga bersahabat',
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS header_alignment text NOT NULL DEFAULT 'left';
