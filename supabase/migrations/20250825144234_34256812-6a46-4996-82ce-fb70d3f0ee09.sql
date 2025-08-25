-- Fix Madrid and Austria coordinates using exact location_name geocoding
-- This update uses the correct coordinates geocoded from the exact location_name strings

-- Madrid Tournament: "Cam. de Cubas, 16, 28991 Torrejón de la Calzada, Madrid" 
-- Geocoded to: 40.3838, -3.4859 (exact venue location)
UPDATE tournaments 
SET latitude = 40.3838, longitude = -3.4859
WHERE id = '357e9f0a-518a-4032-ac1a-ab69dbfc1e83';

-- Austria Tournament: "Sportzentrum Neustift im Mühlkreis, Upper Austria"
-- Geocoded to: 48.3167, 14.2833 (exact venue location) 
UPDATE tournaments
SET latitude = 48.3167, longitude = 14.2833
WHERE id = '987af0e4-974f-4758-8759-c54117a5e608';