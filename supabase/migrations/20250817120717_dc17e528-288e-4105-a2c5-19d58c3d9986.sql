-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension (required for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the review request function to run daily at 10 AM
SELECT cron.schedule(
  'send-review-request-emails',
  '0 10 * * *', -- Daily at 10 AM UTC
  $$
  SELECT public.send_review_request_emails();
  $$
);