-- Fix Birmingham tournament coordinates
-- Birmingham B1 1JW should be around 52.4796, -1.9026 (city center)
UPDATE tournaments 
SET 
  latitude = 52.4796,
  longitude = -1.9026,
  updated_at = now()
WHERE id = 'c5037d7b-14e2-493a-88a2-e04305a63e5c' 
  AND name = 'Birmingham Tournaments 2026';