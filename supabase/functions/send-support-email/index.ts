import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("🚀 EMAIL FUNCTION DEPLOY - send-support-email");

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
    console.log("🔍 Starting email function...");
    
    // Check environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    console.log('🔑 HAS_RESEND_KEY:', !!RESEND_API_KEY);
    
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY missing");
      return new Response(JSON.stringify({ 
        stage: "env_check", 
        error: "Missing RESEND_API_KEY" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log('🔑 Key length:', RESEND_API_KEY.length);
    
    // Parse request
    console.log("📝 Parsing request...");
    const body = await req.json();
    console.log("📋 Request body:", body);
    
    const { name, email, subject, message } = body;
    
    if (!name || !email || !subject || !message) {
      console.log("❌ Missing fields");
      return new Response(JSON.stringify({ 
        stage: "validation", 
        error: "Missing required fields",
        received: { name: !!name, email: !!email, subject: !!subject, message: !!message }
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Prepare email
    const emailPayload = {
      from: 'Support <info@footballtournamentsuk.co.uk>',
      to: ['info@footballtournamentsuk.co.uk'],
      subject: `Support: ${subject} — from ${name}`,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Subject:</b> ${subject}</p><div style="white-space:pre-wrap">${message}</div>`,
    };
    
    console.log("📧 Sending to Resend...");
    
    // Call Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });
    
    const responseText = await response.text();
    console.log('📨 Resend response:', response.status, responseText);
    
    if (!response.ok) {
      console.error("❌ Resend API error");
      return new Response(JSON.stringify({ 
        stage: "resend", 
        status: response.status, 
        body: responseText 
      }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    const responseJson = JSON.parse(responseText);
    console.log("✅ Email sent:", responseJson);
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: responseJson?.id,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("💥 Function error:", error);
    return new Response(JSON.stringify({ 
      stage: "exception", 
      error: error?.message || "Unknown error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});