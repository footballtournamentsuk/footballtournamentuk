import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

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
      return new Response('Tournament ID is required', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log('Generating OG image for tournament:', tournamentId)

    // Fetch tournament data
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (error || !tournament) {
      console.error('Tournament fetch error:', error)
      return new Response('Tournament not found', { 
        status: 404, 
        headers: corsHeaders 
      })
    }

    // Format dates
    const formatDate = (dateStr: string) => {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(new Date(dateStr))
    }

    const startDate = formatDate(tournament.start_date)
    const endDate = formatDate(tournament.end_date)
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`

    // Get tournament type badge color
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'league': return '#16a34a'
        case 'tournament': return '#dc2626'
        case 'camp': return '#ea580c'
        case 'holiday': return '#059669'
        default: return '#6b7280'
      }
    }

    // Generate SVG OG image
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#16a34a"/>
            <stop offset="100%" style="stop-color:#22c55e"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.25)"/>
          </filter>
          <style>
            .title { font-family: system-ui, -apple-system, sans-serif; }
            .text { font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bgGradient)"/>
        
        <!-- Background Pattern -->
        <circle cx="300" cy="150" r="40" fill="rgba(255,255,255,0.1)" opacity="0.5"/>
        <circle cx="900" cy="500" r="60" fill="rgba(255,255,255,0.05)" opacity="0.5"/>
        
        <!-- Main Container -->
        <rect x="40" y="40" width="1120" height="550" rx="24" fill="white" filter="url(#shadow)"/>
        
        <!-- Logo Area -->
        <rect x="100" y="100" width="48" height="48" rx="12" fill="url(#bgGradient)"/>
        <text x="124" y="130" class="text" font-size="24" font-weight="700" fill="white" text-anchor="middle">⚽</text>
        <text x="170" y="130" class="text" font-size="20" font-weight="600" fill="#374151">Football Tournaments UK</text>
        
        <!-- Type Badge -->
        <rect x="950" y="100" width="120" height="36" rx="18" fill="${getTypeColor(tournament.type)}"/>
        <text x="1010" y="122" class="text" font-size="14" font-weight="500" fill="white" text-anchor="middle" text-transform="capitalize">${tournament.type}</text>
        
        <!-- Tournament Name - break into multiple lines if too long -->
        <text x="100" y="220" class="title" font-size="42" font-weight="700" fill="#111827">
          ${tournament.name.length > 30 ? 
            tournament.name.substring(0, 30) + '...' : 
            tournament.name}
        </text>
        
        <!-- Location Icon and Text -->
        <circle cx="118" cy="320" r="12" fill="#16a34a"/>
        <path d="M118 312 L118 328 M110 320 L126 320" stroke="white" stroke-width="2"/>
        <text x="150" y="326" class="text" font-size="18" font-weight="500" fill="#4b5563">${tournament.location_name}</text>
        
        <!-- Date Icon and Text -->
        <rect x="400" y="308" width="24" height="24" rx="4" fill="#16a34a"/>
        <text x="412" y="324" class="text" font-size="12" font-weight="600" fill="white" text-anchor="middle">${new Date(tournament.start_date).getDate()}</text>
        <text x="440" y="326" class="text" font-size="18" font-weight="500" fill="#4b5563">${dateRange}</text>
        
        <!-- Footer Line -->
        <line x1="100" y1="480" x2="1100" y2="480" stroke="#f3f4f6" stroke-width="2"/>
        
        <!-- Website -->
        <text x="100" y="520" class="text" font-size="16" font-weight="500" fill="#6b7280">footballtournamentsuk.co.uk</text>
        
        <!-- CTA Button -->
        <rect x="880" y="500" width="220" height="40" rx="12" fill="url(#bgGradient)"/>
        <text x="990" y="524" class="text" font-size="16" font-weight="600" fill="white" text-anchor="middle">View Tournament Details</text>
      </svg>
    `

    console.log('Generated SVG for tournament:', tournament.name)

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      }
    })

  } catch (error) {
    console.error('OG image generation error:', error)
    
    // Fallback: return a simple SVG
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#16a34a"/>
        <text x="600" y="315" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">Football Tournaments UK</text>
      </svg>
    `
    
    return new Response(fallbackSvg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      }
    })
  }
})