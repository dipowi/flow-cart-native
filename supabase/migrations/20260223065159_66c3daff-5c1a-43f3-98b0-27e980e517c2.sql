
-- 1. Activity table
CREATE TABLE IF NOT EXISTS public.supabase_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  random_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.supabase_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity" ON public.supabase_activity FOR SELECT USING (true);
CREATE POLICY "Anyone can insert activity" ON public.supabase_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update activity" ON public.supabase_activity FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete activity" ON public.supabase_activity FOR DELETE USING (true);

-- 3. Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_supabase_activity_updated_at
  BEFORE UPDATE ON public.supabase_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_activity_updated_at();

-- 4. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
