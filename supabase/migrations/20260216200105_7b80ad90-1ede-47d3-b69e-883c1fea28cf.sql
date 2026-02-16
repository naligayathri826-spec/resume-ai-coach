-- Enable pg_cron and pg_net for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule interview reminders every 5 minutes
SELECT cron.schedule(
  'send-interview-reminders',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://brfnvifwzdnicuxmhwvn.supabase.co/functions/v1/send-interview-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZm52aWZ3emRuaWN1eG1od3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjAyNzYsImV4cCI6MjA3ODUzNjI3Nn0.MNRl3w3Uap3_1XaZQAmPo-Plh7-_j50kKLA0_r7w1xo"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
