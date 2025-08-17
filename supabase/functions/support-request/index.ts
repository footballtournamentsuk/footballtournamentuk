import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

interface SupportRequest {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  honeypot?: string; // spam protection
}

const resend = new Resend(Deno.env.get("SUPPORT_RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: "Invalid authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestData: SupportRequest = await req.json();
    
    // Basic validation
    if (!requestData.name?.trim() || 
        !requestData.email?.trim() || 
        !requestData.subject?.trim() || 
        !requestData.category?.trim() || 
        !requestData.message?.trim()) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Spam protection - if honeypot field is filled, it's likely spam
    if (requestData.honeypot && requestData.honeypot.trim() !== '') {
      console.log('Spam detected via honeypot field');
      return new Response(JSON.stringify({ error: "Request blocked" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate category
    const validCategories = ['General', 'Bug Report', 'Feature Request', 'Billing', 'Other'];
    if (!validCategories.includes(requestData.category)) {
      return new Response(JSON.stringify({ error: "Invalid category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store support ticket in database
    const { data: ticket, error: dbError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        name: requestData.name.trim(),
        email: requestData.email.trim(),
        subject: requestData.subject.trim(),
        category: requestData.category,
        message: requestData.message.trim()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: "Failed to save support request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email to support inbox
    const supportEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
          New Support Request
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Name:</strong> ${requestData.name}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Category:</strong> ${requestData.category}</p>
          <p><strong>Subject:</strong> ${requestData.subject}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #374151;">Message:</h3>
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #22c55e; border-radius: 4px;">
            ${requestData.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
          <p>Submitted: ${new Date().toLocaleString()}</p>
          <p>User ID: ${user.id}</p>
        </div>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Football Tournaments UK <support@footballtournamentsuk.co.uk>',
      to: ['support@footballtournamentsuk.co.uk'], // Replace with actual support inbox
      subject: `[Support] ${requestData.category}: ${requestData.subject}`,
      html: supportEmailHtml,
      replyTo: requestData.email,
    });

    if (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails, ticket is already saved
    }

    // Send confirmation email to user
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Support Request Received</h2>
        
        <p>Hi ${requestData.name},</p>
        
        <p>Thank you for contacting Football Tournaments UK support. We have received your request and will get back to you as soon as possible.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Subject:</strong> ${requestData.subject}</p>
          <p><strong>Category:</strong> ${requestData.category}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>If you need to reference this request, please use ticket ID: <strong>${ticket.id}</strong></p>
        
        <p>Best regards,<br>
        Football Tournaments UK Support Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Please do not reply to this email. If you need to add more information to your request, 
          please submit a new support ticket.
        </p>
      </div>
    `;

    const { error: confirmationError } = await resend.emails.send({
      from: 'Football Tournaments UK <support@footballtournamentsuk.co.uk>',
      to: [requestData.email],
      subject: `Support Request Confirmed - Ticket #${ticket.id.split('-')[0]}`,
      html: confirmationHtml,
    });

    if (confirmationError) {
      console.error('Confirmation email error:', confirmationError);
      // Don't fail the request if confirmation email fails
    }

    console.log(`Support ticket created: ${ticket.id} for user: ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      ticketId: ticket.id,
      message: "Support request submitted successfully" 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('Support request error:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to process support request",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);