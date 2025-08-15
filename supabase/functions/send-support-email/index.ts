// supabase/functions/send-support-email/index.ts
// Deno Edge Function – uses fetch to Resend (no Node SDK)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
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
  const origin = req.headers.get("origin") ?? "*";

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const { name, email, subject, message } = await req.json().catch(() => ({}));
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const body = {
      from: FROM,
      to: TO,
      subject: `Support: ${subject} — from ${name}`,
      // keep it minimal first; you can add "reply_to": email after baseline works
      html: `
        <h2>New Support Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <div style="white-space:pre-wrap">${String(message)}</div>
      `,
    };

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await r.text(); // capture body even on non-2xx
    if (!r.ok) {
      // surface Resend error back to client for debugging
      return new Response(JSON.stringify({ error: "Resend error", status: r.status, body: text }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const json = JSON.parse(text);
    return new Response(JSON.stringify({ id: json?.id ?? null }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
});