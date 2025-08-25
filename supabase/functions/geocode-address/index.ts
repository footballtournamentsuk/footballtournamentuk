import { corsHeaders } from '../_shared/cors.ts'

interface GeocodeRequest {
  location_name: string
  postcode: string
  region: string
  country: string
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
    console.log('🔍 Geocoding request received')
    
    const { location_name, postcode, region, country }: GeocodeRequest = await req.json()
    
    console.log('📍 Geocoding address:', { location_name, postcode, region, country })

    // Get Mapbox token from environment
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
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

    // Build address query prioritizing full venue address - no city center fallbacks
    const queries = [
      // Strategy 1: Complete venue address (primary source of truth)
      `${location_name}, ${postcode}, ${region}, ${country}`,
      // Strategy 2: Venue address with postcode only
      `${location_name}, ${postcode}, ${country}`,
      // Strategy 3: Venue address with region only  
      `${location_name}, ${region}, ${country}`,
      // Strategy 4: Venue address only (last resort)
      `${location_name}, ${country}`
    ]
    
    // Remove empty/invalid queries
    const validQueries = queries.filter(query => 
      query.replace(/,\s*/g, '').length > country.length + 2
    )

    let latitude: number | null = null
    let longitude: number | null = null

    for (const query of validQueries) {
      console.log(`🔎 Trying geocoding query: "${query}"`)
      
      try {
        const geocodeResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${mapboxToken}&` +
          `limit=1&` +
          `types=address,poi,place,postcode`
        )

        if (!geocodeResponse.ok) {
          console.error(`❌ Geocoding API error: ${geocodeResponse.status} ${geocodeResponse.statusText}`)
          continue
        }

        const data = await geocodeResponse.json()
        console.log(`📊 Geocoding response for "${query}":`, JSON.stringify(data, null, 2))

        if (data.features && data.features.length > 0) {
          const feature = data.features[0]
          ;[longitude, latitude] = feature.center
          
          console.log(`✅ Successfully geocoded "${query}" to: ${latitude}, ${longitude}`)
          console.log(`📍 Feature details:`, {
            place_name: feature.place_name,
            place_type: feature.place_type,
            relevance: feature.relevance
          })
          
          // Stop trying once we get a result
          break
        } else {
          console.log(`⚠️ No results for "${query}"`)
        }
      } catch (error) {
        console.error(`❌ Error geocoding "${query}":`, error)
        continue
      }
    }

    if (!latitude || !longitude) {
      console.error('❌ All geocoding attempts failed')
      return new Response(
        JSON.stringify({ 
          error: 'Unable to find the location. Please check the venue address, postcode, and region are correct.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🎯 Final geocoded coordinates: ${latitude}, ${longitude}`)

    return new Response(
      JSON.stringify({ latitude, longitude }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Geocoding function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})