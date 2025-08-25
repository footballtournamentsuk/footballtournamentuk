-- Fix pin coordinates for Madrid and Austria tournaments to match Google Maps locations

-- Madrid: Campo De Futbol Iker Casillas - exact Google Maps coordinates
UPDATE tournaments 
SET 
  latitude = 40.197370,
  longitude = -3.806280,
  updated_at = now()
WHERE id = '357e9f0a-518a-4032-ac1a-ab69dbfc1e83';

-- Austria: Pumptrack Neustift im Mühlkreis - exact Google Maps coordinates  
UPDATE tournaments
SET
  latitude = 48.522750,
  longitude = 13.757840,
  updated_at = now()
WHERE id = '987af0e4-974f-4758-8759-c54117a5e608';