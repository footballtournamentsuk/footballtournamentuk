// supabase/functions/send-support-email/index.ts
// Deno Edge Function – Resend email service - v3 REDEPLOYED
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("🚀 Edge Function Loading - send-support-email v3");

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY"); // Must match secret name exactly
const FROM = 'Support <info@footballtournamentsuk.co.uk>';
const TO = ['info@footballtournamentsuk.co.uk'];

function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req: Request) => {
  console.log("🚀 Function called:", req.method, req.url);
  
  // Explicit env check with detailed logging
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  console.log('HAS_RESEND_KEY:', !!RESEND_API_KEY);
  if (RESEND_API_KEY) {
    console.log('RESEND_KEY_LENGTH:', RESEND_API_KEY.length);
    console.log('RESEND_KEY_PREFIX:', RESEND_API_KEY.substring(0, 8) + '...');
  }
  
  const origin = req.headers.get("origin") ?? "*";

  // Preflight
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight handled");
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    if (req.method !== "POST") {
      console.log("❌ Method not allowed:", req.method);
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not found in environment");
      return new Response(JSON.stringify({ stage: "env_check", error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    console.log("📝 Parsing request body...");
    const { name, email, subject, message } = await req.json().catch(() => ({}));
    console.log("📋 Received data:", { name, email, subject, messageLength: message?.length });
    
    if (!name || !email || !subject || !message) {
      console.log("❌ Missing required fields");
      return new Response(JSON.stringify({ stage: "validation", error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Minimal payload with verified From address
    const body = {
      from: 'Support <info@footballtournamentsuk.co.uk>', // must match verified domain
      to: ['info@footballtournamentsuk.co.uk'],
      subject: `Support: ${subject} — from ${name}`,
      html: `<p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Subject:</b> ${subject}</p>
             <div style="white-space:pre-wrap">${message}</div>`,
    };

    console.log("📧 Sending to Resend API with payload:", JSON.stringify(body, null, 2));
    
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await r.text();
    console.log('RESEND_STATUS:', r.status, 'RESEND_BODY:', text);
    
    if (!r.ok) {
      console.error("❌ Resend API error - Status:", r.status, "Body:", text);
      // Return full error to client for debugging
      return new Response(JSON.stringify({ stage: "resend", status: r.status, body: text }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const json = JSON.parse(text);
    console.log("✅ Email sent successfully:", json);
    return new Response(JSON.stringify({ id: json?.id ?? null, success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } catch (e) {
    console.error("💥 Function error:", e);
    return new Response(JSON.stringify({ stage: "exception", error: e?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
});