import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Tournament {
  id: string
  slug: string | null
  name: string
  updated_at: string
  start_date: string
  status: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting sitemap generation for tournaments...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all active tournaments (not completed)
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('id, slug, name, updated_at, start_date, status')
      .neq('status', 'completed')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching tournaments:', error)
      throw error
    }

    console.log(`Found ${tournaments?.length || 0} active tournaments`)

    // Generate XML sitemap with proper formatting
    const baseUrl = 'https://footballtournamentsuk.co.uk'
    
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    const xmlFooter = '</urlset>'
    
    let xmlUrls = ''

    // Add each tournament to sitemap
    if (tournaments && tournaments.length > 0) {
      for (const tournament of tournaments as Tournament[]) {
        const tournamentUrl = tournament.slug 
          ? `${baseUrl}/tournaments/${tournament.slug}`
          : `${baseUrl}/tournaments/${tournament.id}`
        
        // Format the lastmod date
        const lastmod = new Date(tournament.updated_at).toISOString().split('T')[0]
        
        // Determine change frequency based on tournament status
        let changefreq = 'weekly'
        if (tournament.status === 'today' || tournament.status === 'tomorrow') {
          changefreq = 'daily'
        } else if (tournament.status === 'registration_closes_soon') {
          changefreq = 'daily'
        } else if (tournament.status === 'ongoing') {
          changefreq = 'hourly'
        }

        // Determine priority based on tournament status
        let priority = '0.6'
        if (tournament.status === 'ongoing' || tournament.status === 'today') {
          priority = '0.9'
        } else if (tournament.status === 'tomorrow' || tournament.status === 'registration_closes_soon') {
          priority = '0.8'
        }

        xmlUrls += `  <url>
    <loc>${tournamentUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`
      }
    }

    const xmlContent = xmlHeader + xmlUrls + xmlFooter

    console.log('Successfully generated tournaments sitemap')

    return new Response(xmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})