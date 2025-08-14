// Enhanced CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  console.log(`🔄 Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    console.log(`❌ Method not allowed: ${req.method}`);
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      }), 
      { 
        status: 405,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }

  try {
    console.log('🔑 Processing Mapbox token request...');
    
    // Get all environment variables for debugging
    const envVars = Deno.env.toObject();
    console.log('🔍 Available environment variables:', Object.keys(envVars).filter(key => 
      key.includes('MAPBOX') || key.includes('SUPABASE')
    ));
    
    // Get the Mapbox token from environment variables
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    console.log('🔑 Token check results:');
    console.log('  - Token exists:', !!mapboxToken);
    console.log('  - Token length:', mapboxToken ? mapboxToken.length : 0);
    console.log('  - Token starts with pk.:', mapboxToken ? mapboxToken.startsWith('pk.') : false);
    
    if (!mapboxToken) {
      console.error('❌ MAPBOX_PUBLIC_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Token not configured',
          message: 'MAPBOX_PUBLIC_TOKEN environment variable is not set',
          debug: {
            available_env_keys: Object.keys(envVars).filter(key => 
              key.includes('MAPBOX') || key.includes('TOKEN')
            )
          }
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
      console.error('❌ Invalid token format. Token should start with "pk."');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token format',
          message: 'Mapbox public token must start with "pk."',
          debug: {
            token_prefix: mapboxToken.substring(0, 3),
            token_length: mapboxToken.length
          }
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

    console.log('✅ Valid Mapbox token found');
    console.log('🚀 Returning token to client...');
    
    // Return successful response
    const response = {
      token: mapboxToken,
      success: true,
      timestamp: new Date().toISOString(),
      debug: {
        token_prefix: mapboxToken.substring(0, 10),
        token_length: mapboxToken.length
      }
    };

    console.log('📤 Sending response:', { 
      success: response.success, 
      token_length: response.debug.token_length 
    });
    
    return new Response(
      JSON.stringify(response), 
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in mapbox-token function:');
    console.error('💥 Error type:', typeof error);
    console.error('💥 Error message:', error instanceof Error ? error.message : String(error));
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        debug: {
          error_type: typeof error,
          has_stack: error instanceof Error && !!error.stack
        }
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