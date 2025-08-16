import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  try {
    console.log("🚀 Support Form Email Function - Production v3");
    
    // Get the API key at runtime
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    console.log("📧 All env vars:", Object.keys(Deno.env.toObject()));
    console.log("📧 RESEND_API_KEY Available:", !!RESEND_API_KEY);
    console.log("📧 RESEND_API_KEY Length:", RESEND_API_KEY ? RESEND_API_KEY.length : 0);
    console.log("📧 First 10 chars:", RESEND_API_KEY ? RESEND_API_KEY.substring(0, 10) + "..." : "null");

    if (req.method !== "POST") {
      console.error("❌ Invalid method:", req.method);
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405, 
        headers: cors(origin) 
      });
    }

    if (!RESEND_API_KEY || RESEND_API_KEY.trim() === '') {
      console.error("❌ RESEND_API_KEY not configured or empty");
      return new Response(JSON.stringify({ error: "Email service not configured" }), { 
        status: 500, 
        headers: cors(origin) 
      });
    }

    const { name, email, subject, message } = await req.json().catch(() => ({}));
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("❌ Missing required fields:", { name: !!name, email: !!email, subject: !!subject, message: !!message });
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: cors(origin) 
      });
    }

    console.log("📝 Processing support request from:", email, "Subject:", subject);
    console.log("🔑 About to send with API key length:", RESEND_API_KEY.length);

    const payload = {
      from: FROM,
      to: TO,
      subject: `Support Request: ${subject} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px;">
            New Support Request
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${String(name).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <p><strong>Email:</strong> ${String(email).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <p><strong>Subject:</strong> ${String(subject).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #555; margin-top: 0;">Message:</h3>
            <div style="white-space: pre-wrap; line-height: 1.6;">${String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This email was sent from the Football Tournaments UK support form.</p>
            <p>To reply to the customer, use the email address: ${String(email).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
        </div>
      `,
      reply_to: email,
    };

    console.log("📤 Sending email to Resend API...");
    console.log("📤 Payload:", JSON.stringify({ ...payload, html: "[HTML_CONTENT]" }));
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("📨 Resend API Response Status:", response.status);
    console.log("📨 Resend API Response Body:", responseText);

    if (!response.ok) {
      console.error("❌ Resend API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      return new Response(JSON.stringify({ 
        error: "Failed to send email",
        details: {
          status: response.status,
          message: responseText
        }
      }), {
        status: 502,
        headers: cors(origin),
      });
    }

    const data = JSON.parse(responseText);
    console.log("✅ Email sent successfully. ID:", data?.id);
    
    return new Response(JSON.stringify({ 
      success: true,
      id: data?.id ?? null,
      message: "Support request sent successfully"
    }), { 
      status: 200, 
      headers: cors(origin) 
    });

  } catch (error) {
    console.error("💥 Unexpected error:", error?.message ?? error);
    console.error("💥 Error stack:", error?.stack);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error?.message ?? "Unknown error occurred"
    }), {
      status: 500,
      headers: cors(origin),
    });
  }
});