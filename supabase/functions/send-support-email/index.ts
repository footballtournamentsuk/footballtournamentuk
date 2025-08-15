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
  console.log('HAS_RESEND_KEY:', !!RESEND_API_KEY); // should log true in prod
  
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

    console.log("🔑 Checking RESEND_API_KEY...");
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not found");
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
    console.log("✅ RESEND_API_KEY found, length:", RESEND_API_KEY.length);

    console.log("📝 Parsing request body...");
    const { name, email, subject, message } = await req.json().catch(() => ({}));
    console.log("📋 Received data:", { name, email, subject, messageLength: message?.length });
    
    if (!name || !email || !subject || !message) {
      console.log("❌ Missing required fields");
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const body = {
      from: FROM,
      to: TO,
      subject: `Support: ${subject} — from ${name}`,
      html: `
        <h2>New Support Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <div style="white-space:pre-wrap">${String(message)}</div>
      `,
    };

    console.log("📧 Sending email to Resend API...");
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await r.text();
    console.log("📨 Resend response:", r.status, text);
    
    if (!r.ok) {
      console.error("❌ Resend API error:", r.status, text);
      return new Response(JSON.stringify({ error: "Resend error", status: r.status, body: text }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const json = JSON.parse(text);
    console.log("✅ Email sent successfully:", json);
    return new Response(JSON.stringify({ id: json?.id ?? null }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } catch (e) {
    console.error("💥 Function error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
});