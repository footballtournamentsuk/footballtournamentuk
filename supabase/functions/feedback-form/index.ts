import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const FROM = "Feedback <info@footballtournamentsuk.co.uk>";
const TO = ["info@footballtournamentsuk.co.uk"];

function cors(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };
}

const topicLabels: Record<string, string> = {
  bug: "🐛 Bug Report",
  "tournament-cards": "🏆 Tournament Cards Improvement",
  "missing-info": "📝 Missing Information",
  general: "💡 General Suggestion"
};

serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "*";

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  try {
    console.log("🚀 Feedback Form Function - Processing new feedback");
    
    // Get the API key at runtime
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    console.log("📧 RESEND_API_KEY Available:", !!RESEND_API_KEY);

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

    const { name, email, topic, message } = await req.json().catch(() => ({}));
    
    // Validate required fields
    if (!name || !email || !topic || !message) {
      console.error("❌ Missing required fields:", { name: !!name, email: !!email, topic: !!topic, message: !!message });
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: cors(origin) 
      });
    }

    console.log("📝 Processing feedback from:", email, "Topic:", topic);

    const topicLabel = topicLabels[topic] || topic;

    const payload = {
      from: FROM,
      to: TO,
      subject: `User Feedback: ${topicLabel} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
            New User Feedback
          </h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
            <p><strong>Name:</strong> ${String(name).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <p><strong>Email:</strong> ${String(email).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <p><strong>Feedback Topic:</strong> ${topicLabel}</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #475569; margin-top: 0;">Message:</h3>
            <div style="white-space: pre-wrap; line-height: 1.6; color: #334155;">${String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p>This feedback was submitted from the Football Tournaments UK website.</p>
            <p>Submitted at: ${new Date().toLocaleString()}</p>
            <p>To reply to the user, use: ${String(email).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
        </div>
      `,
      reply_to: email,
    };

    console.log("📤 Sending feedback email to Resend API...");
    
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

    if (!response.ok) {
      console.error("❌ Resend API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      return new Response(JSON.stringify({ 
        error: "Failed to send feedback",
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
    console.log("✅ Feedback email sent successfully. ID:", data?.id);
    
    return new Response(JSON.stringify({ 
      success: true,
      id: data?.id ?? null,
      message: "Feedback submitted successfully"
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