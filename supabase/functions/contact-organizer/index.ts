import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ContactOrganizerRequest {
  tournamentId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { tournamentId, name, email, subject, message }: ContactOrganizerRequest = await req.json();

    console.log("Contact organizer request:", { tournamentId, name, email, subject });

    // Validate required fields
    if (!tournamentId || !name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }), 
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Look up the tournament to get organizer email
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('name, contact_email, contact_name')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      console.error("Tournament lookup error:", tournamentError);
      return new Response(
        JSON.stringify({ error: "Tournament not found" }), 
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("Found tournament:", tournament.name, "organizer:", tournament.contact_email);

    // Send email to organizer
    const emailResponse = await resend.emails.send({
      from: "Football Tournaments UK <noreply@footballtournamentsuk.co.uk>",
      to: [tournament.contact_email],
      subject: `Tournament Inquiry: ${tournament.name} - ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tournament Inquiry</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Tournament Inquiry</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Someone is interested in your tournament</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Tournament: ${tournament.name}</h2>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Message from ${name}:</h3>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; white-space: pre-line;">${message}</p>
              </div>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #dbeafe;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">Contact Information</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
              <p style="margin: 15px 0 5px 0; color: #6b7280; font-size: 14px;">You can reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              This message was sent through Football Tournaments UK
            </p>
            <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
              <a href="https://footballtournamentsuk.co.uk" style="color: #6b7280; text-decoration: none;">footballtournamentsuk.co.uk</a>
            </p>
          </div>
        </body>
        </html>
      `,
      reply_to: email, // Allow organizer to reply directly to the sender
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Message sent successfully to tournament organizer" 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in contact-organizer function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send message", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);