import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("🔥 TEST FUNCTION LOADING - test-deploy");

serve(async (req: Request) => {
  console.log("🔥 TEST FUNCTION CALLED:", req.method, req.url);
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    console.log("🔥 TEST CORS preflight");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log("🔥 TEST RETURNING SUCCESS");
  return new Response(JSON.stringify({ test: "success", timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});