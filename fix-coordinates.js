// Script to re-geocode Madrid and Austria tournaments with exact coordinates
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yknmcddrfkggphrktivd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU'
)

async function fixCoordinates() {
  console.log('🔍 Re-geocoding Madrid and Austria tournaments...')

  // Madrid venue
  console.log('📍 Geocoding Madrid venue...')
  const madridResult = await supabase.functions.invoke('geocode-address', {
    body: {
      location_name: "Cam. de Cubas, 16, 28991 Torrejón de la Calzada, Madrid",
      postcode: "28991",
      region: "Mostoles", 
      country: "ES"
    }
  })

  if (madridResult.error) {
    console.error('❌ Madrid geocoding failed:', madridResult.error)
  } else {
    console.log('✅ Madrid coordinates:', madridResult.data)
    
    // Update Madrid tournament
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({
        latitude: madridResult.data.latitude,
        longitude: madridResult.data.longitude
      })
      .eq('id', '357e9f0a-518a-4032-ac1a-ab69dbfc1e83')
    
    if (updateError) {
      console.error('❌ Failed to update Madrid:', updateError)
    } else {
      console.log('✅ Madrid coordinates updated in database')
    }
  }

  // Austria venue  
  console.log('📍 Geocoding Austria venue...')
  const austriaResult = await supabase.functions.invoke('geocode-address', {
    body: {
      location_name: "Sportzentrum Neustift im Mühlkreis, Upper Austria",
      postcode: "4143",
      region: "Austria",
      country: "AT"
    }
  })

  if (austriaResult.error) {
    console.error('❌ Austria geocoding failed:', austriaResult.error)
  } else {
    console.log('✅ Austria coordinates:', austriaResult.data)
    
    // Update Austria tournament
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({
        latitude: austriaResult.data.latitude,
        longitude: austriaResult.data.longitude
      })
      .eq('id', '987af0e4-974f-4758-8759-c54117a5e608')
    
    if (updateError) {
      console.error('❌ Failed to update Austria:', updateError)
    } else {
      console.log('✅ Austria coordinates updated in database')
    }
  }

  // Verify final coordinates
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, latitude, longitude, location_name')
    .in('id', ['357e9f0a-518a-4032-ac1a-ab69dbfc1e83', '987af0e4-974f-4758-8759-c54117a5e608'])

  console.log('🎯 Final stored coordinates:')
  tournaments?.forEach(t => {
    console.log(`${t.name}: ${t.latitude}, ${t.longitude}`)
  })
}

fixCoordinates().catch(console.error)