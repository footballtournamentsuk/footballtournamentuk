import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("🚀 MINIMAL TEST DEPLOY - send-support-email");

serve(async (req: Request) => {
  console.log("🚀 Function called:", req.method);
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("🔍 Starting function logic...");
    
    // Test 1: Basic response
    console.log("✅ About to return success response");
    return new Response(JSON.stringify({ 
      test: "success", 
      timestamp: new Date().toISOString(),
      method: req.method 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("💥 Function error:", error);
    return new Response(JSON.stringify({ 
      error: "Function crashed",
      message: error?.message || "Unknown error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});