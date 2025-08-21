import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface CreateAlertRequest {
  email: string;
  filters: Record<string, any>;
  frequency: 'daily' | 'weekly';
  source: 'list' | 'city' | 'filters' | 'empty';
}

const generateSecureToken = () => crypto.randomUUID() + '-' + crypto.randomUUID();

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const checkRateLimit = async (email: string): Promise<boolean> => {
  // Check if user has more than 5 active alerts
  const { count } = await supabase
    .from('tournament_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('is_active', true);
    
  return (count || 0) < 5;
};

const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/alerts-verify?token=${verificationToken}`;
  
  try {
    const { error } = await resend.emails.send({
      from: 'Football Tournaments UK <noreply@footballtournamentsuk.co.uk>',
      to: [email],
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
                <a href="${verificationUrl}" 
                   style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  ✅ Activate My Alerts
                </a>
              </div>
              
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #059669; word-break: break-all;">${verificationUrl}</a>
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
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
    
    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { email, filters, frequency, source }: CreateAlertRequest = await req.json();

    // Validation
    if (!email || !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!frequency || !['daily', 'weekly'].includes(frequency)) {
      return new Response(
        JSON.stringify({ error: 'Valid frequency is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!source || !['list', 'city', 'filters', 'empty'].includes(source)) {
      return new Response(
        JSON.stringify({ error: 'Valid source is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const canCreate = await checkRateLimit(email);
    if (!canCreate) {
      return new Response(
        JSON.stringify({ error: 'Maximum number of alerts reached (5 per email)' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate tokens
    const verificationToken = generateSecureToken();
    const managementToken = generateSecureToken();

    // Create alert in database
    const { data: alert, error: dbError } = await supabase
      .from('tournament_alerts')
      .insert({
        email,
        filters: filters || {},
        frequency,
        verification_token: verificationToken,
        management_token: managementToken,
        consent_source: source,
        is_active: false, // Will be activated after verification
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create alert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    console.log('Alert created successfully:', alert.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Alert created successfully. Please check your email to verify.',
        alertId: alert.id
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in alerts function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});