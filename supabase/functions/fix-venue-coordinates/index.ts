import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Tournament {
  id: string
  name: string
  location_name: string
  postcode: string
  region: string
  country: string
  latitude: number
  longitude: number
}

interface GeocodeResponse {
  latitude: number
  longitude: number
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔧 Starting venue coordinate fix for Madrid and Austria tournaments...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get tournament data
    const { data: tournaments, error: fetchError } = await supabase
      .from('tournaments')
      .select('id, name, location_name, postcode, region, country, latitude, longitude')
      .in('id', ['357e9f0a-518a-4032-ac1a-ab69dbfc1e83', '987af0e4-974f-4758-8759-c54117a5e608'])

    if (fetchError) {
      console.error('❌ Error fetching tournaments:', fetchError)
      throw fetchError
    }

    const results = []

    for (const tournament of tournaments as Tournament[]) {
      console.log(`📍 Processing ${tournament.name}...`)
      console.log(`   Current coordinates: ${tournament.latitude}, ${tournament.longitude}`)
      
      // Build exact address string
      const addressParts = [
        tournament.location_name,
        tournament.postcode,
        tournament.region,
        tournament.country
      ].filter(Boolean)
      
      const fullAddress = addressParts.join(', ')
      console.log(`   Full address for geocoding: "${fullAddress}"`)

      // Call geocoding function with exact address components
      const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-address', {
        body: {
          location_name: tournament.location_name,
          postcode: tournament.postcode,
          region: tournament.region,
          country: tournament.country
        }
      })

      if (geocodeError || !geocodeData) {
        console.error(`❌ ${tournament.name} geocoding failed:`, geocodeError?.message || 'No data returned')
        results.push({
          id: tournament.id,
          name: tournament.name,
          address: fullAddress,
          error: geocodeError?.message || 'Geocoding failed',
          latitude: tournament.latitude,
          longitude: tournament.longitude
        })
        continue
      }

      if (geocodeData.error) {
        console.error(`❌ ${tournament.name} geocoding failed:`, geocodeData.error)
        results.push({
          id: tournament.id,
          name: tournament.name,
          address: fullAddress,
          error: geocodeData.error,
          latitude: tournament.latitude,
          longitude: tournament.longitude
        })
        continue
      }

      const newLatitude = geocodeData.latitude
      const newLongitude = geocodeData.longitude
      
      console.log(`✅ ${tournament.name} geocoded successfully:`)
      console.log(`   New coordinates: ${newLatitude}, ${newLongitude}`)

      // Update tournament coordinates
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({
          latitude: newLatitude,
          longitude: newLongitude
        })
        .eq('id', tournament.id)

      if (updateError) {
        console.error(`❌ Failed to update ${tournament.name}:`, updateError)
        results.push({
          id: tournament.id,
          name: tournament.name,
          address: fullAddress,
          error: updateError.message,
          latitude: tournament.latitude,
          longitude: tournament.longitude
        })
        continue
      }

      console.log(`💾 ${tournament.name} coordinates updated in database`)
      
      results.push({
        id: tournament.id,
        name: tournament.name,
        address: fullAddress,
        latitude: newLatitude,
        longitude: newLongitude,
        old_latitude: tournament.latitude,
        old_longitude: tournament.longitude
      })
    }

    // Verify final stored coordinates
    const { data: verifyData } = await supabase
      .from('tournaments')
      .select('id, name, latitude, longitude')
      .in('id', ['357e9f0a-518a-4032-ac1a-ab69dbfc1e83', '987af0e4-974f-4758-8759-c54117a5e608'])

    console.log('🎯 Final stored coordinates:')
    for (const tournament of verifyData || []) {
      console.log(`${tournament.name}: ${tournament.latitude}, ${tournament.longitude}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        final_coordinates: verifyData
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Venue coordinate fix error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})