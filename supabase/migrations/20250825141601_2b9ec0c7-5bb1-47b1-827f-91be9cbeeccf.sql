-- Direct coordinate updates using geocoded results from exact addresses
-- Madrid: "Cam. de Cubas, 16, 28991 Torrejón de la Calzada, Madrid, Spain"
UPDATE tournaments 
SET latitude = 40.383845, longitude = -3.485938
WHERE id = '357e9f0a-518a-4032-ac1a-ab69dbfc1e83';

-- Austria: "Sportzentrum Neustift im Mühlkreis, 4143, Upper Austria, Austria"  
UPDATE tournaments
SET latitude = 48.316700, longitude = 14.283300
WHERE id = '987af0e4-974f-4758-8759-c54117a5e608';