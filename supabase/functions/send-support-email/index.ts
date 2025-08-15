import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("🚀 EMAIL FUNCTION DEPLOY - send-support-email");

// Deno Edge Function (Supabase) — real send, no SDK
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM = 'Football Tournaments UK <onboarding@resend.dev>';
const TO = ['info@footballtournamentsuk.co.uk'];

async function handler(req: Request) {
  const origin = req.headers.get('origin') ?? '*';
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: cors });
  if (!RESEND_API_KEY)        return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500, headers: cors });

  const { name, email, subject, message } = await req.json().catch(() => ({}));
  if (!name || !email || !subject || !message) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: cors });
  }

  const payload = {
    from: FROM,
    to: TO,
    subject: `Support: ${subject} — from ${name}`,
    html: `
      <h2>New Support Request</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Subject:</b> ${subject}</p>
      <div style="white-space:pre-wrap">${String(message)}</div>
    `,
    reply_to: email,
  };

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  console.log('RESEND_STATUS', r.status, 'RESEND_BODY', text);
  if (!r.ok) {
    return new Response(JSON.stringify({ stage: 'resend', status: r.status, body: text }), { status: 502, headers: cors });
  }

  const data = JSON.parse(text);
  return new Response(JSON.stringify({ id: data?.id ?? null }), { status: 200, headers: cors });
}

serve(handler);