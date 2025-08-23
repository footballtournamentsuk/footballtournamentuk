-- Check if extensions are available and enable if needed
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS net WITH SCHEMA extensions;

-- Test a simple HTTP request to verify the extension works
DO $$
BEGIN
    RAISE NOTICE 'Testing net.http_post functionality...';
    
    -- Test with a simple call
    PERFORM net.http_post(
        url := 'https://httpbin.org/post',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{"test": "data"}'::jsonb
    );
    
    RAISE NOTICE 'net.http_post test completed (no error means it works)';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error testing net.http_post: %', SQLERRM;
END $$;