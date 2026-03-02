
-- Create a cron job that does daily maintenance directly in SQL
-- This is fully portable and works automatically after remix

-- First, remove any existing cron job with this name (idempotent)
SELECT cron.unschedule('daily-activity-maintenance')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-activity-maintenance'
);

-- Schedule daily maintenance at 05:00 UTC
SELECT cron.schedule(
  'daily-activity-maintenance',
  '0 5 * * *',
  $$
    -- Insert new activity log
    INSERT INTO public.supabase_activity (activity_type, random_data)
    VALUES ('daily-cron-maintenance', 'Ping at ' || now()::text || ' - Hash: ' || substr(md5(random()::text), 1, 8));

    -- Cleanup: keep only latest 10 rows
    DELETE FROM public.supabase_activity
    WHERE id NOT IN (
      SELECT id FROM public.supabase_activity
      ORDER BY created_at DESC
      LIMIT 10
    );
  $$
);
