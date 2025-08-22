import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    let token: string | null = null;

    // Handle both GET (redirect from email) and POST (from frontend)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      token = url.searchParams.get('token');
      
      // If GET request with token, redirect to frontend
      if (token) {
        const redirectUrl = `https://footballtournamentsuk.co.uk/alerts/verify?token=${encodeURIComponent(token)}`;
        return new Response(null, {
          status: 302,
          headers: {
            'Location': redirectUrl,
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            ...corsHeaders
          }
        });
      }
    } else if (req.method === 'POST') {
      const body = await req.json();
      token = body.token;
    }

    if (!token) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Token is required' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders 
          } 
        }
      );
    }

    // Find and verify the alert
    const { data: alert, error: findError } = await supabase
      .from('tournament_alerts')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (findError || !alert) {
      console.error('Alert not found:', findError);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'This verification link has expired or has already been used.' 
        }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders 
          } 
        }
      );
    }

    // Check if already verified
    if (alert.verified_at) {
      return new Response(
        JSON.stringify({ 
          status: 'already_verified', 
          message: 'Your tournament alerts are already active!',
          alert: {
            id: alert.id,
            frequency: alert.frequency,
            management_token: alert.management_token
          }
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders 
          } 
        }
      );
    }

    // Activate the alert
    const { error: updateError } = await supabase
      .from('tournament_alerts')
      .update({
        is_active: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', alert.id);

    if (updateError) {
      console.error('Error activating alert:', updateError);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'There was an error activating your alerts. Please try again later.' 
        }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log('Alert verified successfully:', alert.id);

    // Success response
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Tournament alerts activated successfully!',
        alert: {
          id: alert.id,
          frequency: alert.frequency,
          management_token: alert.management_token
        }
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in alerts-verify function:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'We encountered an error processing your request. Please try again later.' 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          ...corsHeaders 
        } 
      }
    );
  }
});