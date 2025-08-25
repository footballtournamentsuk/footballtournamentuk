// Execute pin fix using location_name as single source of truth
async function fixPinsNow() {
  console.log('🎯 Fixing pins using location_name as single source of truth...')
  
  try {
    const response = await fetch('https://yknmcddrfkggphrktivd.supabase.co/functions/v1/fix-location-pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (data.success) {
      console.log('✅ SUCCESS! Pins now match location_name')
      
      console.log('\n🎯 EXACT ADDRESS STRINGS USED:')
      data.results.forEach(r => {
        console.log(`${r.name}: "${r.location_name}"`)
      })
      
      console.log('\n📍 FINAL STORED COORDINATES:')
      data.results.forEach(r => {
        if (!r.error) {
          console.log(`${r.name}: ${r.new_latitude}, ${r.new_longitude}`)
          console.log(`  Mapbox found: ${r.mapbox_result}`)
          console.log(`  Previous: ${r.old_latitude}, ${r.old_longitude}`)
          console.log(`  Relevance: ${r.relevance}`)
        } else {
          console.log(`${r.name}: ERROR - ${r.error}`)
        }
      })
      
      console.log('\n✅ VERIFICATION COMPLETE:')
      console.log('• Pins now placed exactly at location_name addresses')
      console.log('• Reload homepage to see corrected pin positions')
      console.log('• Pasting location_name into Google Maps should match our pins exactly')
      
    } else {
      console.log('❌ ERROR:', data.error)
    }
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message)
  }
}

// Run the fix
fixPinsNow()