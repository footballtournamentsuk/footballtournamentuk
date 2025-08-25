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

    // Re-geocode Madrid venue
    console.log('📍 Re-geocoding Madrid venue...')
    const madridResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/geocode-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        location_name: "Cam. de Cubas, 16, 28991 Torrejón de la Calzada, Madrid",
        postcode: "28991",
        region: "Mostoles",
        country: "ES"
      })
    })

    const madridData: GeocodeResponse = await madridResponse.json()
    
    if (madridData.error) {
      console.error('❌ Madrid geocoding failed:', madridData.error)
    } else {
      console.log('✅ Madrid coordinates:', madridData)
      
      // Update Madrid tournament
      const { error: madridUpdateError } = await supabase
        .from('tournaments')
        .update({
          latitude: madridData.latitude,
          longitude: madridData.longitude
        })
        .eq('id', '357e9f0a-518a-4032-ac1a-ab69dbfc1e83')
      
      if (madridUpdateError) {
        console.error('❌ Failed to update Madrid coordinates:', madridUpdateError)
      } else {
        console.log(`✅ Madrid updated: ${madridData.latitude}, ${madridData.longitude}`)
      }
    }

    // Re-geocode Austria venue
    console.log('📍 Re-geocoding Austria venue...')
    const austriaResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/geocode-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        location_name: "Sportzentrum Neustift im Mühlkreis, Upper Austria",
        postcode: "4143",
        region: "Austria",
        country: "AT"
      })
    })

    const austriaData: GeocodeResponse = await austriaResponse.json()
    
    if (austriaData.error) {
      console.error('❌ Austria geocoding failed:', austriaData.error)
    } else {
      console.log('✅ Austria coordinates:', austriaData)
      
      // Update Austria tournament
      const { error: austriaUpdateError } = await supabase
        .from('tournaments')
        .update({
          latitude: austriaData.latitude,
          longitude: austriaData.longitude
        })
        .eq('id', '987af0e4-974f-4758-8759-c54117a5e608')
      
      if (austriaUpdateError) {
        console.error('❌ Failed to update Austria coordinates:', austriaUpdateError)
      } else {
        console.log(`✅ Austria updated: ${austriaData.latitude}, ${austriaData.longitude}`)
      }
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