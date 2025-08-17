-- Make sure pg_net extension is properly enabled
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net SCHEMA extensions;

-- Verify the extension is working by checking available functions  
SELECT 1 FROM pg_proc WHERE proname = 'http_post';