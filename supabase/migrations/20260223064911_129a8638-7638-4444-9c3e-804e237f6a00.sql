
-- Heartbeat table for uptime monitoring
CREATE TABLE IF NOT EXISTS public.heartbeat (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  last_beat timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.heartbeat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for heartbeat"
  ON public.heartbeat FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for heartbeat"
  ON public.heartbeat FOR DELETE USING (true);

CREATE POLICY "Enable select for heartbeat"
  ON public.heartbeat FOR SELECT USING (true);
