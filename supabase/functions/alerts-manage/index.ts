import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ManageAlertRequest {
  action: 'list' | 'update' | 'delete' | 'unsubscribe_all';
  managementToken: string;
  alertId?: string;
  updates?: {
    is_active?: boolean;
    frequency?: 'daily' | 'weekly';
  };
}

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
    const { action, managementToken, alertId, updates }: ManageAlertRequest = await req.json();

    if (!managementToken) {
      return new Response(
        JSON.stringify({ error: 'Management token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify management token exists and get associated email
    const { data: alertCheck, error: checkError } = await supabase
      .from('tournament_alerts')
      .select('email')
      .eq('management_token', managementToken)
      .single();

    if (checkError || !alertCheck) {
      return new Response(
        JSON.stringify({ error: 'Invalid management token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = alertCheck.email;

    switch (action) {
      case 'list': {
        // Get all alerts for this email
        const { data: alerts, error: listError } = await supabase
          .from('tournament_alerts')
          .select('*')
          .eq('email', userEmail)
          .order('created_at', { ascending: false });

        if (listError) {
          console.error('Error listing alerts:', listError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch alerts' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ alerts }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!alertId || !updates) {
          return new Response(
            JSON.stringify({ error: 'Alert ID and updates are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update the specific alert (only if it belongs to this email)
        const { data: updatedAlert, error: updateError } = await supabase
          .from('tournament_alerts')
          .update(updates)
          .eq('id', alertId)
          .eq('email', userEmail)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating alert:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update alert' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!updatedAlert) {
          return new Response(
            JSON.stringify({ error: 'Alert not found or unauthorized' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ alert: updatedAlert }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!alertId) {
          return new Response(
            JSON.stringify({ error: 'Alert ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete the specific alert (only if it belongs to this email)
        const { error: deleteError } = await supabase
          .from('tournament_alerts')
          .delete()
          .eq('id', alertId)
          .eq('email', userEmail);

        if (deleteError) {
          console.error('Error deleting alert:', deleteError);
          return new Response(
            JSON.stringify({ error: 'Failed to delete alert' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'unsubscribe_all': {
        // Delete all alerts for this email
        const { error: deleteAllError } = await supabase
          .from('tournament_alerts')
          .delete()
          .eq('email', userEmail);

        if (deleteAllError) {
          console.error('Error unsubscribing all:', deleteAllError);
          return new Response(
            JSON.stringify({ error: 'Failed to unsubscribe' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('All alerts deleted for email:', userEmail);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in alerts-manage function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});