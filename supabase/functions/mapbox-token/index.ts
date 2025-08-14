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
    console.log('🔍 Environment check...');
    
    // Get the Mapbox token from environment variables (Supabase secrets)
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    console.log('🔑 Token exists:', !!mapboxToken);
    console.log('🔑 Token length:', mapboxToken ? mapboxToken.length : 0);
    console.log('🔑 Token starts with pk.:', mapboxToken ? mapboxToken.startsWith('pk.') : false);
    
    if (!mapboxToken) {
      console.error('❌ MAPBOX_PUBLIC_TOKEN not found in environment variables');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => key.includes('MAPBOX')));
      
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          message: 'Please configure MAPBOX_PUBLIC_TOKEN in Supabase secrets',
          available_mapbox_vars: Object.keys(Deno.env.toObject()).filter(key => key.includes('MAPBOX'))
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

    if (!mapboxToken.startsWith('pk.')) {
      console.error('❌ Invalid Mapbox token format - must start with pk.');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token format',
          message: 'Mapbox public token must start with pk.'
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
        success: true,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('💥 Error in mapbox-token function:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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