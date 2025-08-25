import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('🎯 Starting exact address geocoding for Madrid and Austria tournaments...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (!mapboxToken) {
      console.error('❌ MAPBOX_PUBLIC_TOKEN not found')
      return new Response(
        JSON.stringify({ error: 'Geocoding service unavailable' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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

    for (const tournament of tournaments as any[]) {
      console.log(`📍 Processing ${tournament.name}...`)
      console.log(`   Current coordinates: ${tournament.latitude}, ${tournament.longitude}`)
      
      // Use EXACT location_name as provided, optionally append postcode and region
      let exactAddress = tournament.location_name
      
      // Append postcode and region if available
      if (tournament.postcode) {
        exactAddress += `, ${tournament.postcode}`
      }
      if (tournament.region && tournament.region !== tournament.location_name) {
        exactAddress += `, ${tournament.region}`
      }
      
      console.log(`   Exact address for geocoding: "${exactAddress}"`)

      // Geocode using Mapbox directly
      try {
        const geocodeResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(exactAddress)}.json?` +
          `access_token=${mapboxToken}&` +
          `limit=1&` +
          `types=address,poi,place`
        )

        if (!geocodeResponse.ok) {
          console.error(`❌ Geocoding API error: ${geocodeResponse.status} ${geocodeResponse.statusText}`)
          results.push({
            id: tournament.id,
            name: tournament.name,
            address: exactAddress,
            error: `Geocoding API error: ${geocodeResponse.status}`,
            latitude: tournament.latitude,
            longitude: tournament.longitude
          })
          continue
        }

        const geocodeData = await geocodeResponse.json()
        console.log(`📊 Geocoding response for "${exactAddress}":`, JSON.stringify(geocodeData, null, 2))

        if (!geocodeData.features || geocodeData.features.length === 0) {
          console.error(`❌ No geocoding results for "${exactAddress}"`)
          results.push({
            id: tournament.id,
            name: tournament.name,
            address: exactAddress,
            error: 'No geocoding results found',
            latitude: tournament.latitude,
            longitude: tournament.longitude
          })
          continue
        }

        const feature = geocodeData.features[0]
        const [longitude, latitude] = feature.center
        
        console.log(`✅ ${tournament.name} geocoded successfully:`)
        console.log(`   Address: "${exactAddress}"`)
        console.log(`   New coordinates: ${latitude}, ${longitude}`)
        console.log(`   Feature details:`, {
          place_name: feature.place_name,
          place_type: feature.place_type,
          relevance: feature.relevance
        })

        // Update tournament coordinates
        const { error: updateError } = await supabase
          .from('tournaments')
          .update({
            latitude: latitude,
            longitude: longitude
          })
          .eq('id', tournament.id)

        if (updateError) {
          console.error(`❌ Failed to update ${tournament.name}:`, updateError)
          results.push({
            id: tournament.id,
            name: tournament.name,
            address: exactAddress,
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
          address: exactAddress,
          latitude: latitude,
          longitude: longitude,
          old_latitude: tournament.latitude,
          old_longitude: tournament.longitude,
          place_name: feature.place_name,
          relevance: feature.relevance
        })

      } catch (error) {
        console.error(`❌ Error geocoding "${exactAddress}":`, error)
        results.push({
          id: tournament.id,
          name: tournament.name,
          address: exactAddress,
          error: error.message,
          latitude: tournament.latitude,
          longitude: tournament.longitude
        })
      }
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
    console.error('❌ Exact address geocoding error:', error)
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