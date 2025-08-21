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
    const alertId = url.searchParams.get('alert_id');

    if (!token) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Unsubscribe Link</title>
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
              <p>This unsubscribe link is invalid or expired.</p>
              <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
            </div>
          </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (alertId) {
      // Unsubscribe from specific alert
      const { data: alert, error: findError } = await supabase
        .from('tournament_alerts')
        .select('email, management_token')
        .eq('id', alertId)
        .eq('management_token', token)
        .single();

      if (findError || !alert) {
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Alert Not Found</title>
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
                <h1 class="error">❌ Alert Not Found</h1>
                <p>This alert has already been removed or the link is invalid.</p>
                <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
              </div>
            </body>
          </html>
          `,
          { status: 404, headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Delete the specific alert
      const { error: deleteError } = await supabase
        .from('tournament_alerts')
        .delete()
        .eq('id', alertId);

      if (deleteError) {
        console.error('Error deleting alert:', deleteError);
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Unsubscribe Failed</title>
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
                <h1 class="error">❌ Unsubscribe Failed</h1>
                <p>There was an error processing your request. Please try again later.</p>
                <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
              </div>
            </body>
          </html>
          `,
          { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
      }

      console.log('Alert unsubscribed successfully:', alertId);

      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Successfully Unsubscribed</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .success { color: #059669; }
              .btn { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px; }
              .btn-secondary { background: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">✅ Successfully Unsubscribed</h1>
              <p>You have been unsubscribed from this tournament alert.</p>
              <p>You can still manage your other alerts if you have any.</p>
              <div>
                <a href="https://footballtournamentsuk.co.uk/alerts/manage/${alert.management_token}" class="btn">Manage Other Alerts</a>
                <a href="https://footballtournamentsuk.co.uk" class="btn btn-secondary">Browse Tournaments</a>
              </div>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );

    } else {
      // Unsubscribe from all alerts for this management token
      const { data: alerts, error: findError } = await supabase
        .from('tournament_alerts')
        .select('email')
        .eq('management_token', token)
        .limit(1);

      if (findError || !alerts || alerts.length === 0) {
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>No Alerts Found</title>
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
                <h1 class="error">❌ No Alerts Found</h1>
                <p>No alerts found for this unsubscribe link.</p>
                <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
              </div>
            </body>
          </html>
          `,
          { status: 404, headers: { 'Content-Type': 'text/html' } }
        );
      }

      const userEmail = alerts[0].email;

      // Delete all alerts for this email
      const { error: deleteError } = await supabase
        .from('tournament_alerts')
        .delete()
        .eq('email', userEmail);

      if (deleteError) {
        console.error('Error deleting all alerts:', deleteError);
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Unsubscribe Failed</title>
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
                <h1 class="error">❌ Unsubscribe Failed</h1>
                <p>There was an error processing your request. Please try again later.</p>
                <a href="https://footballtournamentsuk.co.uk">Return to Homepage</a>
              </div>
            </body>
          </html>
          `,
          { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
      }

      console.log('All alerts unsubscribed successfully for email:', userEmail);

      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Successfully Unsubscribed from All</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .success { color: #059669; }
              .btn { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">✅ Successfully Unsubscribed</h1>
              <p>You have been unsubscribed from all tournament alerts.</p>
              <p>You will no longer receive any email notifications from us.</p>
              <p>Thanks for being part of the Football Tournaments UK community!</p>
              <a href="https://footballtournamentsuk.co.uk" class="btn">Browse Tournaments</a>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

  } catch (error) {
    console.error('Error in alerts-unsubscribe function:', error);
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