-- Test the trigger function by calling it manually on a tournament
DO $$
DECLARE
    test_tournament_id UUID := 'd02f2be5-7d68-4709-8c10-d19944087514'; -- The XXXX tournament from the logs
BEGIN
    -- Call the edge function directly to test
    PERFORM net.http_post(
        url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/alerts-instant',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE2ODMxNSwiZXhwIjoyMDcwNzQ0MzE1fQ.ELLaJpQOdQ1_8aagR-qLCtgPJSDnF6_LbMrW2rGFO_w"}'::jsonb,
        body := json_build_object(
            'tournamentId', test_tournament_id,
            'action', 'created'
        )::jsonb
    );
    
    RAISE NOTICE 'Manual trigger test completed for tournament: %', test_tournament_id;
END $$;