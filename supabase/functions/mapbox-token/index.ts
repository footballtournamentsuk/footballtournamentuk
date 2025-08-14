// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  console.log(`🔄 Request: ${req.method} ${new URL(req.url).pathname}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    console.log(`❌ Method ${req.method} not allowed`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('🔑 Fetching Mapbox token...');
    
    // Get token from environment variable
    let mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    console.log('🔍 Secret token exists:', !!mapboxToken);
    
    // Fallback: use the provided token directly if secret isn't working
    if (!mapboxToken) {
      console.log('⚠️ Using fallback token');
      mapboxToken = 'pk.eyJ1IjoidG91cm5hbWVudCIsImEiOiJjbWViZTYwaXYxM3d0MnFzaG5xdzRzc3YxIn0.PhoACBcRkMmbG6TNv6WP5Q';
    }
    
    // Validate token format
    if (!mapboxToken || !mapboxToken.startsWith('pk.')) {
      console.error('❌ Invalid token format');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token',
          message: 'Token must start with pk.'
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Valid token found, length:', mapboxToken.length);
    
    // Return success response
    const response = {
      token: mapboxToken,
      success: true,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Returning token response');
    
    return new Response(
      JSON.stringify(response), 
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

  } catch (error) {
    console.error('💥 Function error:', error);
    console.error('💥 Error details:', {
      message: error?.message,
      stack: error?.stack,
      type: typeof error
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});