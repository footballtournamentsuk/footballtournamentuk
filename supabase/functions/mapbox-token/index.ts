const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Mapbox token request received');
    
    // Get the Mapbox token from environment variables (Supabase secrets)
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!mapboxToken) {
      console.error('❌ MAPBOX_PUBLIC_TOKEN not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          message: 'Please configure MAPBOX_PUBLIC_TOKEN in Supabase secrets'
        }), 
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    console.log('✅ Mapbox token found:', mapboxToken.substring(0, 20) + '...');
    console.log('🚀 Returning token to client');
    
    // Return the token to the client
    return new Response(
      JSON.stringify({ 
        token: mapboxToken,
        success: true
      }), 
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate' // No caching to ensure fresh token
        }
      }
    );

  } catch (error) {
    console.error('💥 Error in mapbox-token function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});