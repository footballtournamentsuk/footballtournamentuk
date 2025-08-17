import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'
import { getThemeForType } from './themes.ts'
import { generateSVGTemplate, generateFallbackSVG, formatDateRange, TournamentData, TemplateData } from './templates.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const tournamentId = url.searchParams.get('tournamentId')
    
    if (!tournamentId) {
      console.error('Tournament ID is required')
      return new Response('Tournament ID is required', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log('Generating OG image for tournament:', tournamentId)

    // Fetch tournament data from Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('id, name, type, location_name, start_date, end_date')
      .eq('id', tournamentId)
      .single()

    if (error || !tournament) {
      console.error('Tournament fetch error:', error)
      return new Response(generateFallbackSVG(), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour on error
        }
      })
    }

    // Get theme based on tournament type
    const theme = getThemeForType(tournament.type)
    
    // Format dates
    const dateRange = formatDateRange(tournament.start_date, tournament.end_date)
    const formattedStartDate = new Date(tournament.start_date).getDate().toString()
    
    // Prepare template data
    const templateData: TemplateData = {
      tournament: tournament as TournamentData,
      theme,
      dateRange,
      formattedStartDate
    }

    // Generate SVG
    const svg = generateSVGTemplate(templateData)
    
    console.log(`Generated OG image for tournament: ${tournament.name} (${tournament.type})`)

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      }
    })

  } catch (error) {
    console.error('OG image generation error:', error)
    
    return new Response(generateFallbackSVG(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour on error
      }
    })
  }
})