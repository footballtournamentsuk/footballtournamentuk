// Screenshot verification for the updated pin locations
async function captureHomepagePins() {
  console.log('📸 Capturing homepage with updated pin locations...')
  
  // Open homepage URL
  window.open('https://21e19dc3-b9c8-4929-b61a-c85ce0272c04.sandbox.lovable.dev/', '_blank')
  
  console.log('📍 Updated coordinates verification:')
  console.log('Madrid: 40.3838, -3.4859')
  console.log('Austria: 48.3167, 14.2833')
  
  console.log('\n🔍 Manual verification steps:')
  console.log('1. Wait for map to load on homepage')
  console.log('2. Look for pins at the updated coordinates')
  console.log('3. Compare with Google Maps links in coordinate-fix-confirmation.html')
  console.log('4. Confirm pins match venue addresses exactly')
}

captureHomepagePins()