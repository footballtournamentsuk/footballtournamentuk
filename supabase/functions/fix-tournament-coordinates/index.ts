import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'
import { corsHeaders } from '../_shared/cors.ts'

interface GeocodeResponse {
  latitude: number
  longitude: number
  error?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔧 Starting coordinate fix for Madrid and Austria tournaments...')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Direct geocoding using Mapbox API
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    if (!mapboxToken) {
      throw new Error('MAPBOX_PUBLIC_TOKEN not configured')
    }

    // Madrid full address geocoding
    console.log('📍 Geocoding Madrid venue with full address...')
    const madridFullAddress = "Cam. de Cubas, 16, 28991 Torrejón de la Calzada, Madrid, Spain"
    console.log('🔍 Madrid address string:', madridFullAddress)
    
    const madridGeocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(madridFullAddress)}.json?access_token=${mapboxToken}&limit=1&country=ES`
    const madridResponse = await fetch(madridGeocodeUrl)
    const madridGeoData = await madridResponse.json()
    
    if (madridGeoData.features && madridGeoData.features.length > 0) {
      const madridCoords = madridGeoData.features[0].geometry.coordinates
      const madridLng = madridCoords[0]
      const madridLat = madridCoords[1]
      
      console.log('✅ Madrid geocoded coordinates:', madridLat, madridLng)
      console.log('📍 Madrid place name:', madridGeoData.features[0].place_name)
      
      // Update Madrid tournament
      const { error: madridUpdateError } = await supabase
        .from('tournaments')
        .update({
          latitude: madridLat,
          longitude: madridLng
        })
        .eq('id', '357e9f0a-518a-4032-ac1a-ab69dbfc1e83')
      
      if (madridUpdateError) {
        console.error('❌ Failed to update Madrid coordinates:', madridUpdateError)
      } else {
        console.log(`✅ Madrid coordinates updated in DB: ${madridLat}, ${madridLng}`)
      }
    } else {
      console.error('❌ Madrid geocoding failed: No results found')
    }

    // Austria full address geocoding
    console.log('📍 Geocoding Austria venue with full address...')
    const austriaFullAddress = "Sportzentrum Neustift im Mühlkreis, 4143, Upper Austria, Austria"
    console.log('🔍 Austria address string:', austriaFullAddress)
    
    const austriaGeocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(austriaFullAddress)}.json?access_token=${mapboxToken}&limit=1&country=AT`
    const austriaResponse = await fetch(austriaGeocodeUrl)
    const austriaGeoData = await austriaResponse.json()
    
    if (austriaGeoData.features && austriaGeoData.features.length > 0) {
      const austriaCoords = austriaGeoData.features[0].geometry.coordinates
      const austriaLng = austriaCoords[0]
      const austriaLat = austriaCoords[1]
      
      console.log('✅ Austria geocoded coordinates:', austriaLat, austriaLng)
      console.log('📍 Austria place name:', austriaGeoData.features[0].place_name)
      
      // Update Austria tournament
      const { error: austriaUpdateError } = await supabase
        .from('tournaments')
        .update({
          latitude: austriaLat,
          longitude: austriaLng
        })
        .eq('id', '987af0e4-974f-4758-8759-c54117a5e608')
      
      if (austriaUpdateError) {
        console.error('❌ Failed to update Austria coordinates:', austriaUpdateError)
      } else {
        console.log(`✅ Austria coordinates updated in DB: ${austriaLat}, ${austriaLng}`)
      }
    } else {
      console.error('❌ Austria geocoding failed: No results found')
    }

    // Get final coordinates for confirmation
    const { data: finalTournaments } = await supabase
      .from('tournaments')
      .select('id, name, latitude, longitude, location_name')
      .in('id', ['357e9f0a-518a-4032-ac1a-ab69dbfc1e83', '987af0e4-974f-4758-8759-c54117a5e608'])

    console.log('🎯 Final stored coordinates:')
    const results = finalTournaments?.map(t => ({
      name: t.name,
      latitude: t.latitude,
      longitude: t.longitude,
      location: t.location_name
    })) || []

    results.forEach(t => {
      console.log(`${t.name}: ${t.latitude}, ${t.longitude}`)
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tournament coordinates updated successfully',
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Fix coordinates error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})