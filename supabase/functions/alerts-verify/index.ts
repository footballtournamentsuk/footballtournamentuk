import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Verification Link</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Invalid Link</h1>
              <p>This verification link is invalid or expired.</p>
              <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
            </div>
          </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
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
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Failed</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Verification Failed</h1>
              <p>This verification link has expired or has already been used.</p>
              <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
            </div>
          </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Check if already verified
    if (alert.verified_at) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Already Verified</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .success { color: #059669; }
              .btn { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 10px 0 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">✅ Already Verified</h1>
              <p>Your tournament alerts are already active!</p>
              <a href="https://footballtournamentsuk.co.uk/alerts/manage/${alert.management_token}" class="btn">Manage Alerts</a>
              <a href="https://footballtournamentsuk.co.uk" class="btn" style="background: #6b7280;">Browse Tournaments</a>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
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
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Activation Failed</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Activation Failed</h1>
              <p>There was an error activating your alerts. Please try again later.</p>
              <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
            </div>
          </body>
        </html>
        `,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }

    console.log('Alert verified successfully:', alert.id);

    // Success page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tournament Alerts Activated!</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .success { color: #059669; margin-bottom: 20px; }
            .btn { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px; }
            .btn-secondary { background: #6b7280; }
            .info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">🎉 Tournament Alerts Activated!</h1>
            <p>Your tournament alerts are now active. You'll receive ${alert.frequency} emails when new tournaments match your criteria.</p>
            
            <div class="info">
              <strong>What's next?</strong><br>
              • We'll send you ${alert.frequency} digests with matching tournaments<br>
              • Daily alerts arrive at 8:00 AM UK time<br>
              • Weekly alerts arrive on Sundays at 6:00 PM UK time<br>
              • You can manage or unsubscribe anytime
            </div>
            
            <div>
              <a href="https://footballtournamentsuk.co.uk/alerts/manage/${alert.management_token}" class="btn">Manage Your Alerts</a>
              <a href="https://footballtournamentsuk.co.uk" class="btn btn-secondary">Browse Tournaments</a>
            </div>
          </div>
        </body>
      </html>
      `,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Error in alerts-verify function:', error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Something went wrong</h1>
            <p>We encountered an error processing your request. Please try again later.</p>
            <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
          </div>
        </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
});