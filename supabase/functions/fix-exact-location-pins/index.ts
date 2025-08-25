import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface GeocodeResponse {
  latitude: number
  longitude: number
  place_name: string
  relevance: number
  raw_response: any
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎯 Starting exact location pin fix...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get tournament data with exact location_name strings
    const { data: tournaments, error: fetchError } = await supabase
      .from('tournaments')
      .select('id, name, location_name, latitude, longitude')
      .in('id', ['357e9f0a-518a-4032-ac1a-ab69dbfc1e83', '987af0e4-974f-4758-8759-c54117a5e608'])

    if (fetchError) {
      console.error('❌ Error fetching tournaments:', fetchError)
      throw fetchError
    }

    console.log(`📍 Found ${tournaments.length} tournaments to process`)

    const results = []

    for (const tournament of tournaments) {
      console.log(`\n🔍 Processing: ${tournament.name}`)
      console.log(`📍 Exact location_name: "${tournament.location_name}"`)
      console.log(`🔄 Current coordinates: ${tournament.latitude}, ${tournament.longitude}`)
      
      // Geocode the exact location_name string using Mapbox
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(tournament.location_name)}.json?access_token=${mapboxToken}&limit=1`
      
      console.log(`🌐 Geocoding URL: ${geocodeUrl}`)
      
      const geocodeResponse = await fetch(geocodeUrl)
      const geocodeData = await geocodeResponse.json()
      
      console.log(`📦 Raw geocode response:`, JSON.stringify(geocodeData, null, 2))
      
      if (!geocodeData.features || geocodeData.features.length === 0) {
        console.error(`❌ No geocoding results for ${tournament.name}`)
        results.push({
          id: tournament.id,
          name: tournament.name,
          location_name: tournament.location_name,
          error: 'No geocoding results found',
          old_latitude: tournament.latitude,
          old_longitude: tournament.longitude,
          geocode_request: geocodeUrl,
          raw_response: geocodeData
        })
        continue
      }

      const feature = geocodeData.features[0]
      const [longitude, latitude] = feature.center
      
      console.log(`✅ Geocoded coordinates: ${latitude}, ${longitude}`)
      console.log(`📍 Place name: ${feature.place_name}`)
      console.log(`🎯 Relevance: ${feature.relevance}`)

      // Update tournament coordinates in database
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
          location_name: tournament.location_name,
          error: updateError.message,
          old_latitude: tournament.latitude,
          old_longitude: tournament.longitude,
          geocode_request: geocodeUrl,
          raw_response: geocodeData
        })
        continue
      }

      console.log(`💾 Updated ${tournament.name} coordinates in database`)
      
      results.push({
        id: tournament.id,
        name: tournament.name,
        location_name: tournament.location_name,
        latitude: latitude,
        longitude: longitude,
        old_latitude: tournament.latitude,
        old_longitude: tournament.longitude,
        place_name: feature.place_name,
        relevance: feature.relevance,
        geocode_request: geocodeUrl,
        raw_response: feature
      })
    }

    // Verify final stored coordinates
    const { data: verifyData } = await supabase
      .from('tournaments')
      .select('id, name, location_name, latitude, longitude')
      .in('id', ['357e9f0a-518a-4032-ac1a-ab69dbfc1e83', '987af0e4-974f-4758-8759-c54117a5e608'])

    console.log('\n🎯 Final verification - stored coordinates:')
    for (const tournament of verifyData || []) {
      console.log(`${tournament.name}: ${tournament.latitude}, ${tournament.longitude}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        final_coordinates: verifyData,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Exact location pin fix error:', error)
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