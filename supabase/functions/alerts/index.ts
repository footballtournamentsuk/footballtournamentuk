import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CreateAlertRequest {
  email: string;
  filters: Record<string, any>;
  frequency: 'daily' | 'weekly' | 'instant';
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

const sendVerificationEmail = async (email: string, verificationToken: string, alertId: string, retryCount = 0): Promise<void> => {
  const maxRetries = 3;
  const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
  
  try {
    console.log(`Sending verification email to ${email}, attempt ${retryCount + 1}/${maxRetries + 1}`);
    
    // Use the existing send-email function with proper error handling
    const response = await fetch('https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        type: 'alert_verify',
        to: email,
        data: {
          verificationToken,
          verificationUrl: `https://footballtournamentsuk.co.uk/alerts/verify?token=${verificationToken}`
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Send-email returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Verification email sent successfully via send-email function:', result);
    
    // Log successful delivery
    await supabase
      .from('alert_deliveries')
      .insert({
        alert_id: alertId,
        status: 'sent',
        item_count: 1
      });
    
  } catch (error) {
    console.error(`Failed to send verification email (attempt ${retryCount + 1}):`, error);
    
    // Log failed delivery attempt
    await supabase
      .from('alert_deliveries')
      .insert({
        alert_id: alertId,
        status: 'failed',
        item_count: 0,
        error: `Verification email failed: ${error.message}`,
        sent_at: new Date().toISOString()
      });

    if (retryCount < maxRetries) {
      console.log(`Retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return sendVerificationEmail(email, verificationToken, alertId, retryCount + 1);
    } else {
      console.error('Max retries reached, giving up on verification email');
      throw error;
    }
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
    console.log('Received request body:', await req.clone().text());
    const { email, filters, frequency, source }: CreateAlertRequest = await req.json();
    console.log('Parsed values:', { email, filters, frequency, source });

    // Validation
    if (!email || !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!frequency || !['daily', 'weekly', 'instant'].includes(frequency)) {
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
    console.log('Generating tokens...');
    const verificationToken = generateSecureToken();
    const managementToken = generateSecureToken();
    console.log('Tokens generated successfully');

    // Create alert in database
    console.log('Inserting alert into database...');
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

    console.log('Database operation result:', { alert, dbError });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create alert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send verification email with retries
    console.log('Sending verification email...');
    try {
      await sendVerificationEmail(email, verificationToken, alert.id);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email after all retries:', emailError);
      // Return error to user if email fails completely
      return new Response(
        JSON.stringify({ 
          error: 'Alert created but verification email failed. Please try again later.',
          alertId: alert.id
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});