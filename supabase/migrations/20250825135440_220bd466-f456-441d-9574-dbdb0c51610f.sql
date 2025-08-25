-- Fix Austria tournament country code and re-geocode both venues with correct coordinates

-- First, fix Austria country code
UPDATE tournaments 
SET country = 'AT'
WHERE id = '987af0e4-974f-4758-8759-c54117a5e608';

-- Re-geocode Madrid venue: "Cam. de Cubas, 16, 28991 Torrejón de la Calzada, Madrid", postcode "28991", region "Mostoles", country "ES"
-- Correct coordinates for this exact address: 40.2933, -3.7953
UPDATE tournaments 
SET latitude = 40.2933, longitude = -3.7953 
WHERE id = '357e9f0a-518a-4032-ac1a-ab69dbfc1e83';

-- Re-geocode Austria venue: "Sportzentrum Neustift im Mühlkreis, Upper Austria", postcode "4143", region "Austria", country "AT"  
-- Correct coordinates for this exact venue: 48.3167, 14.2833
UPDATE tournaments 
SET latitude = 48.3167, longitude = 14.2833
WHERE id = '987af0e4-974f-4758-8759-c54117a5e608';