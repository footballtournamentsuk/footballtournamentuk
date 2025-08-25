// Execute the exact location pin fix immediately
async function runExactPinFixNow() {
  console.log('🎯 Executing exact location pin fix NOW...')
  
  try {
    const response = await fetch('https://yknmcddrfkggphrktivd.supabase.co/functions/v1/fix-exact-location-pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (data.success) {
      console.log('✅ SUCCESS! Exact location pin fix completed')
      
      console.log('\n📍 EXACT ADDRESS STRINGS USED (from DB location_name):')
      data.results.forEach(r => {
        console.log(`${r.name}:`)
        console.log(`  "${r.location_name}"`)
      })
      
      console.log('\n🌐 MAPBOX GEOCODING REQUESTS & RAW RESPONSES:')
      data.results.forEach(r => {
        if (!r.error) {
          console.log(`\n${r.name}:`)
          console.log(`  📍 Mapbox Request URL:`)
          console.log(`  ${r.geocode_request}`)
          console.log(`  📦 Raw JSON Response Feature:`)
          console.log(`  ${JSON.stringify(r.raw_response, null, 4)}`)
          console.log(`  🎯 Chosen Coordinates: [${r.longitude}, ${r.latitude}]`)
        } else {
          console.log(`\n${r.name}: ERROR - ${r.error}`)
        }
      })
      
      console.log('\n🎯 FINAL STORED COORDINATES (6+ decimals):')
      data.results.forEach(r => {
        if (!r.error) {
          console.log(`${r.name}:`)
          console.log(`  New: ${r.latitude.toFixed(8)}, ${r.longitude.toFixed(8)}`)
          console.log(`  Old: ${r.old_latitude.toFixed(8)}, ${r.old_longitude.toFixed(8)}`)
          console.log(`  Place: ${r.place_name}`)
          console.log(`  Relevance: ${r.relevance}`)
        }
      })
      
      console.log('\n🔍 VERIFICATION LINKS:')
      data.results.forEach(r => {
        if (!r.error) {
          const gmapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(r.location_name)}`
          console.log(`${r.name}:`)
          console.log(`  Google Maps: ${gmapsUrl}`)
          console.log(`  Our Site: https://21e19dc3-b9c8-4929-b61a-c85ce0272c04.sandbox.lovable.dev/`)
        }
      })
      
      console.log('\n✅ EXECUTION COMPLETE:')
      console.log('• Database updated with Mapbox geocoded coordinates')
      console.log('• Homepage map will now show pins at exact venue locations')
      console.log('• Pins should match Google Maps results for the same addresses')
      console.log('• Refresh homepage to see updated pin positions')
      
    } else {
      console.log('❌ ERROR:', data.error)
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message)
  }
}

// Execute immediately
runExactPinFixNow()