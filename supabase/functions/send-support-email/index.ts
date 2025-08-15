import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("🚀 FRESH DEPLOY - send-support-email v4");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("🚀 FRESH FUNCTION CALLED:", req.method, req.url);
  
  // CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight handled");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Environment check
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    console.log('🔑 HAS_RESEND_KEY:', !!RESEND_API_KEY);
    if (RESEND_API_KEY) {
      console.log('🔑 KEY_LENGTH:', RESEND_API_KEY.length);
      console.log('🔑 KEY_PREFIX:', RESEND_API_KEY.substring(0, 8) + '...');
    }

    if (req.method !== "POST") {
      console.log("❌ Method not allowed:", req.method);
      return new Response(JSON.stringify({ stage: "method", error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY missing from environment");
      return new Response(JSON.stringify({ stage: "env_check", error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Parse request
    console.log("📝 Parsing request body...");
    const { name, email, subject, message } = await req.json().catch(() => ({}));
    console.log("📋 Data received:", { name, email, subject, messageLength: message?.length });
    
    if (!name || !email || !subject || !message) {
      console.log("❌ Missing required fields");
      return new Response(JSON.stringify({ stage: "validation", error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Prepare email payload
    const emailPayload = {
      from: 'Support <info@footballtournamentsuk.co.uk>',
      to: ['info@footballtournamentsuk.co.uk'],
      subject: `Support: ${subject} — from ${name}`,
      html: `<p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Subject:</b> ${subject}</p>
             <div style="white-space:pre-wrap">${message}</div>`,
    };

    console.log("📧 Calling Resend API...");
    console.log("📧 Payload:", JSON.stringify(emailPayload, null, 2));

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const responseText = await response.text();
    console.log('📨 RESEND_STATUS:', response.status);
    console.log('📨 RESEND_BODY:', responseText);
    
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
    console.log("✅ Email sent successfully:", responseJson);
    
    return new Response(JSON.stringify({ 
      id: responseJson?.id ?? null, 
      success: true 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("💥 Function error:", error);
    return new Response(JSON.stringify({ 
      stage: "exception", 
      error: error?.message ?? "Server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});