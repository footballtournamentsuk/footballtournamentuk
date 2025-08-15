import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Support <info@footballtournamentsuk.co.uk>";
const TO = ["info@footballtournamentsuk.co.uk"];

serve(async (req: Request) => {
  console.log("🚀 Function invoked:", req.method);
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight handled");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("🔍 Processing POST request...");
    
    // Check API key
    if (!RESEND_API_KEY) {
      console.log("❌ Missing RESEND_API_KEY");
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
    console.log("✅ RESEND_API_KEY exists");

    if (req.method !== "POST") {
      console.log("❌ Invalid method:", req.method);
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("✅ Request parsed successfully");
    } catch (error) {
      console.log("❌ JSON parse error:", error.message);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log("📋 Received data:", JSON.stringify(requestData, null, 2));
    
    const { name, email, subject, message } = requestData || {};
    if (!name || !email || !subject || !message) {
      console.log("❌ Missing fields:", { 
        name: !!name, 
        email: !!email, 
        subject: !!subject, 
        message: !!message,
        receivedFields: Object.keys(requestData || {})
      });
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    console.log("✅ All required fields present");

    // Prepare email payload
    const payload = {
      from: FROM,
      to: TO,
      subject: `Support: ${subject} — from ${name}`,
      html: `<h2>New Support Request</h2>
             <p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Subject:</b> ${subject}</p>
             <div style="white-space:pre-wrap">${String(message)}</div>`,
    };
    console.log("✅ Email payload prepared");

    // Send via Resend API
    console.log("📤 Sending email via Resend...");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("📥 Resend response:", response.status, responseText);

    if (!response.ok) {
      console.log("❌ Resend API error:", response.status, responseText);
      return new Response(JSON.stringify({ 
        stage: "resend", 
        status: response.status, 
        body: responseText 
      }), { 
        status: 502, 
        headers: corsHeaders 
      });
    }

    const data = JSON.parse(responseText);
    console.log("✅ Email sent successfully, ID:", data?.id);
    
    return new Response(JSON.stringify({ id: data?.id ?? null }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error?.message || "Unknown error"
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});