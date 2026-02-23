
-- 1. Rename image_url to image_urls (array)
ALTER TABLE public.products ADD COLUMN image_urls text[] NOT NULL DEFAULT '{}';
UPDATE public.products SET image_urls = ARRAY[image_url];
ALTER TABLE public.products DROP COLUMN image_url;

-- 2. Make checkout columns nullable
ALTER TABLE public.products ALTER COLUMN checkout_type DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN checkout_target DROP NOT NULL;

-- 3. Create store_settings table (single-row global config)
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  global_checkout_type text NOT NULL DEFAULT 'whatsapp',
  global_checkout_target text NOT NULL DEFAULT '',
  global_checkout_message text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Store settings are publicly readable"
ON public.store_settings FOR SELECT USING (true);

-- Insert default row
INSERT INTO public.store_settings (global_checkout_type, global_checkout_target, global_checkout_message)
VALUES ('whatsapp', '', null);

-- Update products RLS: add insert/update/delete for authenticated admins (prep for admin)
-- We need user_roles table for admin access

-- Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: only admins can read
CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Products: admin insert/update/delete
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Store settings: admin update
CREATE POLICY "Admins can update store settings"
ON public.store_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
