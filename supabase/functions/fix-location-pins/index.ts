import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎯 Fixing location pins using location_name as single source of truth...')
    
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

    // Get Madrid and Austria tournament data
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
      console.log(`\n📍 Processing ${tournament.name}...`)
      console.log(`   Current coordinates: ${tournament.latitude}, ${tournament.longitude}`)
      
      // Use ONLY the location_name as the single source of truth
      const exactLocationName = tournament.location_name
      
      console.log(`   🎯 EXACT location_name (single source of truth): "${exactLocationName}"`)

      // Geocode using ONLY the location_name - no postcode/region additions
      try {
        const geocodeResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(exactLocationName)}.json?` +
          `access_token=${mapboxToken}&` +
          `limit=1&` +
          `types=address,poi,place`
        )

        if (!geocodeResponse.ok) {
          console.error(`❌ Geocoding API error: ${geocodeResponse.status} ${geocodeResponse.statusText}`)
          results.push({
            id: tournament.id,
            name: tournament.name,
            location_name: exactLocationName,
            error: `Geocoding API error: ${geocodeResponse.status}`,
            current_latitude: tournament.latitude,
            current_longitude: tournament.longitude
          })
          continue
        }

        const geocodeData = await geocodeResponse.json()
        console.log(`📊 Geocoding response for "${exactLocationName}":`)
        console.log(`   Found ${geocodeData.features?.length || 0} results`)

        if (!geocodeData.features || geocodeData.features.length === 0) {
          console.error(`❌ No geocoding results for "${exactLocationName}"`)
          results.push({
            id: tournament.id,
            name: tournament.name,
            location_name: exactLocationName,
            error: 'No geocoding results found for location_name',
            current_latitude: tournament.latitude,
            current_longitude: tournament.longitude
          })
          continue
        }

        const feature = geocodeData.features[0]
        const [longitude, latitude] = feature.center
        
        console.log(`✅ ${tournament.name} geocoded from location_name:`)
        console.log(`   Input: "${exactLocationName}"`)
        console.log(`   Result: ${feature.place_name}`)
        console.log(`   New coordinates: ${latitude}, ${longitude}`)
        console.log(`   Old coordinates: ${tournament.latitude}, ${tournament.longitude}`)
        console.log(`   Relevance: ${feature.relevance}`)
        console.log(`   Place type: ${feature.place_type}`)

        // Update tournament coordinates to match location_name
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
            location_name: exactLocationName,
            error: updateError.message,
            current_latitude: tournament.latitude,
            current_longitude: tournament.longitude
          })
          continue
        }

        console.log(`💾 ${tournament.name} coordinates updated to match location_name`)
        
        results.push({
          id: tournament.id,
          name: tournament.name,
          location_name: exactLocationName,
          mapbox_result: feature.place_name,
          new_latitude: latitude,
          new_longitude: longitude,
          old_latitude: tournament.latitude,
          old_longitude: tournament.longitude,
          relevance: feature.relevance,
          place_type: feature.place_type
        })

      } catch (error) {
        console.error(`❌ Error geocoding "${exactLocationName}":`, error)
        results.push({
          id: tournament.id,
          name: tournament.name,
          location_name: exactLocationName,
          error: error.message,
          current_latitude: tournament.latitude,
          current_longitude: tournament.longitude
        })
      }
    }

    // Verify final stored coordinates
    const { data: verifyData } = await supabase
      .from('tournaments')
      .select('id, name, location_name, latitude, longitude')
      .in('id', ['357e9f0a-518a-4032-ac1a-ab69dbfc1e83', '987af0e4-974f-4758-8759-c54117a5e608'])

    console.log('\n🎯 FINAL VERIFICATION - Coordinates now match location_name:')
    for (const tournament of verifyData || []) {
      console.log(`${tournament.name}:`)
      console.log(`  location_name: "${tournament.location_name}"`)
      console.log(`  coordinates: ${tournament.latitude}, ${tournament.longitude}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Pins now match location_name as single source of truth",
        results,
        final_coordinates: verifyData
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Location pin fix error:', error)
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