-- Update Madrid tournament with correct coordinates for Torrejón de la Calzada venue
UPDATE tournaments 
SET latitude = 40.2971, longitude = -3.4851 
WHERE id = '357e9f0a-518a-4032-ac1a-ab69dbfc1e83';

-- Update Austria tournament with correct coordinates for Neustift im Mühlkreis venue  
UPDATE tournaments 
SET latitude = 48.3167, longitude = 14.2833
WHERE id = '987af0e4-974f-4758-8759-c54117a5e608';