import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Support <info@footballtournamentsuk.co.uk>";
const TO = ["info@footballtournamentsuk.co.uk"];

function cors(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "*";

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  try {
    console.log("BOOT send-support-email");
    console.log("HAS_RESEND_KEY", !!RESEND_API_KEY);

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: cors(origin) });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500, headers: cors(origin) });
    }

    const { name, email, subject, message } = await req.json().catch(() => ({}));
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: cors(origin) });
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
      // Add later after baseline works:
      // reply_to: email,
    };

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    console.log("RESEND_STATUS", r.status);
    console.log("RESEND_BODY", text);

    if (!r.ok) {
      // Surface exact error from Resend to the client
      return new Response(JSON.stringify({ stage: "resend", status: r.status, body: text }), {
        status: 502,
        headers: cors(origin),
      });
    }

    const data = JSON.parse(text);
    return new Response(JSON.stringify({ id: data?.id ?? null }), { status: 200, headers: cors(origin) });
  } catch (e) {
    console.error("EDGE_FN_ERROR", e?.message ?? e);
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), {
      status: 500,
      headers: cors(origin),
    });
  }
});