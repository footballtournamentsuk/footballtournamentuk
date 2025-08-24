import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const emailFrom = Deno.env.get("EMAIL_FROM") || "Football Tournaments UK <info@footballtournamentsuk.co.uk>";

interface EmailRequest {
  type: 'welcome' | 'tournament_created' | 'review_request' | 'alert_verify';
  to: string;
  data: {
    userName?: string;
    tournamentName?: string;
    tournamentUrl?: string;
    dateRange?: string;
    location?: string;
    verificationToken?: string;
    verificationUrl?: string;
  };
  sender_type?: 'creator_confirmation' | 'user_action';
}

// Simple rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 minutes
    return true;
  }
  
  if (limit.count >= 5) {
    return false;
  }
  
  limit.count++;
  return true;
}

function validateEmailRequest(request: EmailRequest): string | null {
  if (!request.type || !request.to || !request.data) {
    return "Missing required fields: type, to, data";
  }

  if (!['welcome', 'tournament_created', 'review_request', 'alert_verify'].includes(request.type)) {
    return "Invalid email type. Must be: welcome, tournament_created, review_request, or alert_verify";
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(request.to)) {
    return "Invalid email address format";
  }

  // Type-specific validation
  switch (request.type) {
    case 'welcome':
      if (!request.data.userName) {
        return "userName is required for welcome emails";
      }
      break;
    case 'tournament_created':
      if (!request.data.userName || !request.data.tournamentName || !request.data.tournamentUrl) {
        return "userName, tournamentName, and tournamentUrl are required for tournament_created emails";
      }
      break;
    case 'review_request':
      if (!request.data.userName || !request.data.tournamentName) {
        return "userName and tournamentName are required for review_request emails";
      }
      break;
  }

  return null;
}

function generateEmailContent(request: EmailRequest): { subject: string; html: string; replyTo?: string } {
  const { type, data } = request;

  switch (type) {
    case 'welcome':
      return {
        subject: `[Football Tournaments UK] Welcome, ${data.userName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
              Welcome to Football Tournaments UK!
            </h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>Welcome to Football Tournaments UK! We're excited to have you join our community of football enthusiasts.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #6b7280;">
                <li>Browse upcoming tournaments in your area</li>
                <li>Register your team for competitions</li>
                <li>Connect with other football teams</li>
                <li>Track your tournament history</li>
              </ul>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>
            The Football Tournaments UK Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent because you created an account on Football Tournaments UK.
            </p>
          </div>
        `
      };

    case 'tournament_created':
      return {
        subject: `[Football Tournaments UK] Tournament created: ${data.tournamentName}`,
        replyTo: 'info@footballtournamentsuk.co.uk',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
              Tournament Created Successfully!
            </h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>Great news! Your tournament has been created and is now live on Football Tournaments UK.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Tournament Details:</h3>
              <p><strong>Name:</strong> ${data.tournamentName}</p>
              ${data.dateRange ? `<p><strong>Date:</strong> ${data.dateRange}</p>` : ''}
              ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
              <p><strong>Tournament URL:</strong> <a href="${data.tournamentUrl}" style="color: #22c55e;">${data.tournamentUrl}</a></p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151;">Next Steps:</h3>
              <ul style="color: #6b7280;">
                <li>Share your tournament link with teams</li>
                <li>Monitor registrations in your dashboard</li>
                <li>Update tournament details if needed</li>
                <li>Communicate with registered teams</li>
              </ul>
            </div>
            
            <p>If you need any assistance managing your tournament, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            The Football Tournaments UK Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              You received this email because you created a tournament on Football Tournaments UK.
            </p>
          </div>
        `
      };

    case 'review_request':
      return {
        subject: `[Football Tournaments UK] How was ${data.tournamentName}? Leave a quick review`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
              How was your tournament experience?
            </h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>We hope you had a great time at <strong>${data.tournamentName}</strong>!</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #374151; margin-top: 0;">Share Your Experience</h3>
              <p style="color: #6b7280; margin-bottom: 20px;">
                Your feedback helps other teams discover great tournaments and helps organizers improve their events.
              </p>
              ${data.tournamentUrl ? `
                <a href="${data.tournamentUrl}#reviews" 
                   style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Leave a Review
                </a>
              ` : ''}
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151;">What to include in your review:</h3>
              <ul style="color: #6b7280;">
                <li>Organization and communication</li>
                <li>Venue and facilities quality</li>
                <li>Overall tournament experience</li>
                <li>Any suggestions for improvement</li>
              </ul>
            </div>
            
            <p>Thank you for being part of the Football Tournaments UK community!</p>
            
            <p>Best regards,<br>
            The Football Tournaments UK Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              You received this email because you participated in a tournament through Football Tournaments UK.
            </p>
          </div>
        `
      };

    case 'alert_verify':
      return {
        subject: 'Verify your tournament alerts subscription',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Tournament Alerts</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin-bottom: 10px;">🏆 Football Tournaments UK</h1>
                <h2 style="color: #374151; font-weight: 600;">Verify Your Tournament Alerts</h2>
              </div>
              
              <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 16px;">Hi there!</p>
                <p style="margin: 0 0 16px 0;">You've requested to receive tournament alerts. To activate your subscription, please click the button below:</p>
                
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${data.verificationUrl}" 
                     style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                    ✅ Activate My Alerts
                  </a>
                </div>
                
                <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${data.verificationUrl}" style="color: #059669; word-break: break-all;">${data.verificationUrl}</a>
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p style="margin-top: 16px;">
                  Best regards,<br>
                  The Football Tournaments UK Team
                </p>
              </div>
            </body>
          </html>
        `
      };

    default:
      throw new Error(`Unsupported email type: ${type}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: "Method not allowed. Use POST." 
    }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const requestData: EmailRequest = await req.json();
    
    // Rate limiting - exempt creator confirmation emails from rate limiting
    if (requestData.sender_type !== 'creator_confirmation') {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      if (!checkRateLimit(clientIP)) {
        console.log(`Rate limit exceeded for IP: ${clientIP}`);
        return new Response(JSON.stringify({ 
          ok: false, 
          error: "Rate limit exceeded. Please try again later." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.log(`Bypassing rate limit for creator confirmation email to: ${requestData.to}`);
    }

    // Validate request
    const validationError = validateEmailRequest(requestData);
    if (validationError) {
      console.log(`Validation error: ${validationError}`);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: validationError 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate email content
    const { subject, html, replyTo } = generateEmailContent(requestData);

    // Send email
    const emailPayload: any = {
      from: emailFrom,
      to: [requestData.to],
      subject,
      html,
    };

    if (replyTo) {
      emailPayload.replyTo = replyTo;
    }

    const { data, error: emailError } = await resend.emails.send(emailPayload);

    if (emailError) {
      console.error(`Email sending failed for type ${requestData.type}:`, emailError);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "Failed to send email" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Email sent successfully: ${requestData.type} to ${requestData.to}`);

    return new Response(JSON.stringify({ 
      ok: true, 
      id: data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('Send email error:', error.message);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);