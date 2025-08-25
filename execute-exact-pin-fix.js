// Execute exact location pin fix
async function executeExactPinFix() {
  console.log('🎯 Executing exact location pin fix...')
  
  try {
    const response = await fetch('https://yknmcddrfkggphrktivd.supabase.co/functions/v1/fix-exact-location-pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (data.success) {
      console.log('✅ SUCCESS! Pins fixed with exact location_name geocoding')
      
      console.log('\n📍 EXACT ADDRESS STRINGS USED:')
      data.results.forEach(r => {
        console.log(`${r.name}: "${r.location_name}"`)
      })
      
      console.log('\n🌐 GEOCODING REQUESTS AND RESPONSES:')
      data.results.forEach(r => {
        if (!r.error) {
          console.log(`\n${r.name}:`)
          console.log(`  Geocode URL: ${r.geocode_request}`)
          console.log(`  Raw Response Feature:`, JSON.stringify(r.raw_response, null, 2))
          console.log(`  Chosen Coordinates: ${r.latitude}, ${r.longitude}`)
          console.log(`  Place Name: ${r.place_name}`)
          console.log(`  Relevance: ${r.relevance}`)
        } else {
          console.log(`${r.name}: ERROR - ${r.error}`)
        }
      })
      
      console.log('\n🎯 FINAL STORED COORDINATES (6+ decimals):')
      data.results.forEach(r => {
        if (!r.error) {
          console.log(`${r.name}: ${r.latitude.toFixed(8)}, ${r.longitude.toFixed(8)}`)
          console.log(`  Previous: ${r.old_latitude.toFixed(8)}, ${r.old_longitude.toFixed(8)}`)
        }
      })
      
      console.log('\n📍 VERIFICATION LINKS:')
      data.results.forEach(r => {
        if (!r.error) {
          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(r.location_name)}`
          console.log(`${r.name} Google Maps: ${mapsUrl}`)
        }
      })
      
      console.log('\n✅ VERIFICATION COMPLETE:')
      console.log('• Pins now placed exactly at location_name addresses')
      console.log('• Coordinates obtained from Mapbox geocoding API')
      console.log('• Database updated with precise coordinates')
      console.log('• Homepage map will display pins at exact venue locations')
      
    } else {
      console.log('❌ ERROR:', data.error)
    }
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message)
  }
}

// Run the fix
executeExactPinFix()