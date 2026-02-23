
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  original_price TEXT,
  discount_percentage TEXT,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  checkout_type TEXT NOT NULL CHECK (checkout_type IN ('whatsapp', 'telegram', 'link')),
  checkout_target TEXT NOT NULL,
  checkout_message TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS (public read, admin write later)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read policy for storefront
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (true);
