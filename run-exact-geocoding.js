// Direct execution of exact address geocoding
async function runExactGeocoding() {
  console.log('🎯 Running exact address geocoding...')
  
  try {
    const response = await fetch('https://yknmcddrfkggphrktivd.supabase.co/functions/v1/geocode-exact-addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (data.success) {
      console.log('✅ SUCCESS!')
      console.log('\n📍 EXACT ADDRESS STRINGS USED:')
      data.results.forEach(r => {
        console.log(`${r.name}: "${r.address}"`)
      })
      
      console.log('\n🎯 FINAL STORED COORDINATES:')
      data.results.forEach(r => {
        if (!r.error) {
          console.log(`${r.name}: ${r.latitude}, ${r.longitude}`)
          console.log(`  Previous: ${r.old_latitude}, ${r.old_longitude}`)
          console.log(`  Mapbox Result: ${r.place_name}`)
          console.log(`  Relevance: ${r.relevance}`)
        } else {
          console.log(`${r.name}: ERROR - ${r.error}`)
        }
      })
    } else {
      console.log('❌ ERROR:', data.error)
    }
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message)
  }
}

// Run it
runExactGeocoding()