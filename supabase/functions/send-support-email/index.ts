import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("🚀 MINIMAL TEST - send-support-email");

serve(async (req: Request) => {
  console.log("📞 Function called:", req.method);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("✅ CORS preflight handled");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("🔍 Processing request...");
    
    // Test environment variable access
    const hasApiKey = !!Deno.env.get('RESEND_API_KEY');
    console.log("🔑 Has API Key:", hasApiKey);
    
    // Test request parsing
    let requestData;
    try {
      requestData = await req.json();
      console.log("📝 Request parsed successfully");
    } catch (error) {
      console.log("❌ JSON parse error:", error.message);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    // Return success with debug info
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      hasApiKey,
      requestReceived: !!requestData
    };
    
    console.log("✅ Returning success response");
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("💥 Function error:", error);
    return new Response(JSON.stringify({ 
      error: 'Function error',
      message: error?.message || 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});