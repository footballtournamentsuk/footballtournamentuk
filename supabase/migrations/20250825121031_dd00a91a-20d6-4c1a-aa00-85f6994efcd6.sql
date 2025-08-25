-- Fix incorrect coordinates for Madrid and Austria tournaments
UPDATE tournaments 
SET 
  latitude = 40.416775, 
  longitude = -3.703790 
WHERE id = '357e9f0a-518a-4032-ac1a-ab69dbfc1e83';

UPDATE tournaments 
SET 
  latitude = 48.271140, 
  longitude = 14.291290 
WHERE id = '987af0e4-974f-4758-8759-c54117a5e608';