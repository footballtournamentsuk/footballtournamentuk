import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface Tournament {
  id: string;
  name: string;
  slug: string;
  location_name: string;
  start_date: string;
  end_date: string;
  format: string;
  age_groups: string[];
  type: string;
  cost_amount: number | null;
  cost_currency: string;
  banner_url: string | null;
}

interface Alert {
  id: string;
  email: string;
  filters: any;
  frequency: 'daily' | 'weekly';
  management_token: string;
  last_sent_at: string | null;
}

const matchesTournamentFilters = (tournament: Tournament, filters: any): boolean => {
  // Location matching
  if (filters.location && !tournament.location_name.toLowerCase().includes(filters.location.toLowerCase())) {
    return false;
  }

  // Format matching
  if (filters.format && filters.format.length > 0) {
    if (!filters.format.includes(tournament.format)) {
      return false;
    }
  }

  // Age groups matching
  if (filters.ageGroups && filters.ageGroups.length > 0) {
    const hasMatchingAge = filters.ageGroups.some((age: string) =>
      tournament.age_groups.includes(age)
    );
    if (!hasMatchingAge) {
      return false;
    }
  }

  // Type matching
  if (filters.type && filters.type.length > 0) {
    if (!filters.type.includes(tournament.type)) {
      return false;
    }
  }

  // Price range matching
  if (filters.priceRange && tournament.cost_amount !== null) {
    const [min, max] = filters.priceRange;
    if (tournament.cost_amount < min || tournament.cost_amount > max) {
      return false;
    }
  }

  // Date range matching
  if (filters.dateRange) {
    const tournamentStart = new Date(tournament.start_date);
    
    if (filters.dateRange.from) {
      const filterFrom = new Date(filters.dateRange.from);
      if (tournamentStart < filterFrom) {
        return false;
      }
    }
    
    if (filters.dateRange.to) {
      const filterTo = new Date(filters.dateRange.to);
      if (tournamentStart > filterTo) {
        return false;
      }
    }
  }

  return true;
};

const generateDigestEmail = (tournaments: Tournament[], alert: Alert): string => {
  const baseUrl = 'https://footballtournamentsuk.co.uk';
  const managementUrl = `${baseUrl}/alerts/manage/${alert.management_token}`;
  const unsubscribeUrl = `${managementUrl}?unsubscribe=true`;
  
  // Build filter query string for tournament links
  const buildTournamentUrl = (tournament: Tournament) => {
    const params = new URLSearchParams();
    
    // Add filters to URL so they're pre-applied
    if (alert.filters.location) params.set('location', alert.filters.location);
    if (alert.filters.format?.length) params.set('format', alert.filters.format.join(','));
    if (alert.filters.ageGroups?.length) params.set('ageGroups', alert.filters.ageGroups.join(','));
    if (alert.filters.type?.length) params.set('type', alert.filters.type.join(','));
    
    const queryString = params.toString();
    return `${baseUrl}/tournaments/${tournament.slug || tournament.id}${queryString ? `?${queryString}` : ''}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const formatPrice = (amount: number | null, currency: string) => {
    if (amount === null) return 'Contact for pricing';
    return `${currency === 'GBP' ? '£' : currency}${amount}`;
  };

  const tournamentCards = tournaments.slice(0, 10).map(tournament => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px; background: white;">
      ${tournament.banner_url ? `
        <img src="${tournament.banner_url}" alt="${tournament.name}" style="width: 100%; height: 150px; object-fit: cover;">
      ` : ''}
      <div style="padding: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">
          <a href="${buildTournamentUrl(tournament)}" style="color: #059669; text-decoration: none;">
            ${tournament.name}
          </a>
        </h3>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
          📍 ${tournament.location_name}
        </p>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
          📅 ${formatDateRange(tournament.start_date, tournament.end_date)}
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
          <span style="background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
            ⚽ ${tournament.format}
          </span>
          <span style="background: #f0f9ff; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
            🏆 ${tournament.type}
          </span>
          ${tournament.age_groups.map(age => `
            <span style="background: #f0fdf4; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
              👥 ${age}
            </span>
          `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: #059669;">
            ${formatPrice(tournament.cost_amount, tournament.cost_currency)}
          </span>
          <a href="${buildTournamentUrl(tournament)}" 
             style="background: #059669; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
            View Details →
          </a>
        </div>
      </div>
    </div>
  `).join('');

  const subject = tournaments.length === 1 
    ? `New tournament: ${tournaments[0].name}`
    : `${tournaments.length} new tournaments matching your interests`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; background: white; padding: 24px; border-radius: 8px;">
          <h1 style="color: #059669; margin-bottom: 10px; font-size: 24px;">⚽ Football Tournaments UK</h1>
          <h2 style="color: #374151; font-weight: 600; margin: 0; font-size: 20px;">
            ${tournaments.length === 1 ? 'New Tournament Alert' : `${tournaments.length} New Tournaments`}
          </h2>
          <p style="color: #6b7280; margin: 8px 0 0 0;">
            ${alert.frequency === 'daily' ? 'Daily' : 'Weekly'} digest for ${alert.email}
          </p>
        </div>

        <!-- Tournament Cards -->
        <div style="margin-bottom: 30px;">
          ${tournamentCards}
        </div>

        ${tournaments.length > 10 ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0; color: #1d4ed8; font-weight: 500;">
              📧 And ${tournaments.length - 10} more tournaments...
            </p>
            <a href="${baseUrl}/tournaments?${new URLSearchParams(alert.filters).toString()}" 
               style="color: #059669; text-decoration: none; font-weight: 600;">
              View all matching tournaments →
            </a>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="background: white; padding: 24px; border-radius: 8px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${managementUrl}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 12px;">
              ⚙️ Manage Alerts
            </a>
            <a href="${baseUrl}/tournaments" 
               style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              🔍 Browse All
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280; text-align: center;">
            <p style="margin: 0 0 8px 0;">
              You're receiving this because you subscribed to tournament alerts.
            </p>
            <p style="margin: 0;">
              <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">
                Unsubscribe from all alerts
              </a> | 
              <a href="${baseUrl}/policies" style="color: #6b7280; text-decoration: underline;">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { frequency } = await req.json();
    
    if (!frequency || !['daily', 'weekly'].includes(frequency)) {
      return new Response(
        JSON.stringify({ error: 'Valid frequency required (daily or weekly)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting ${frequency} digest generation...`);

    // Get current time in UK timezone
    const now = new Date();
    const cutoffTime = frequency === 'daily' 
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Get active alerts for this frequency
    const { data: alerts, error: alertsError } = await supabase
      .from('tournament_alerts')
      .select('*')
      .eq('frequency', frequency)
      .eq('is_active', true)
      .not('verified_at', 'is', null);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      throw alertsError;
    }

    console.log(`Found ${alerts?.length || 0} active ${frequency} alerts`);

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: `No active ${frequency} alerts found` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get tournaments that are new or recently updated
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false });

    if (tournamentsError) {
      console.error('Error fetching tournaments:', tournamentsError);
      throw tournamentsError;
    }

    console.log(`Found ${tournaments?.length || 0} tournaments since ${cutoffTime.toISOString()}`);

    if (!tournaments || tournaments.length === 0) {
      console.log('No new tournaments found, skipping digest');
      return new Response(
        JSON.stringify({ message: 'No new tournaments found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let totalSent = 0;
    let totalFailed = 0;

    // Process each alert
    for (const alert of alerts) {
      try {
        // Skip if already sent recently (for daily: within last 20 hours, for weekly: within last 6 days)
        if (alert.last_sent_at) {
          const lastSent = new Date(alert.last_sent_at);
          const minInterval = frequency === 'daily' ? 20 * 60 * 60 * 1000 : 6 * 24 * 60 * 60 * 1000;
          
          if (now.getTime() - lastSent.getTime() < minInterval) {
            console.log(`Skipping alert ${alert.id} - sent too recently`);
            continue;
          }
        }

        // Filter tournaments based on alert criteria
        const matchingTournaments = tournaments.filter(tournament => 
          matchesTournamentFilters(tournament, alert.filters)
        );

        if (matchingTournaments.length === 0) {
          console.log(`No matching tournaments for alert ${alert.id}`);
          continue;
        }

        console.log(`Sending digest to ${alert.email} with ${matchingTournaments.length} tournaments`);

        // Generate and send email
        const emailHtml = generateDigestEmail(matchingTournaments, alert);
        const subject = matchingTournaments.length === 1 
          ? `New tournament: ${matchingTournaments[0].name}`
          : `${matchingTournaments.length} new tournaments matching your interests`;

        const { error: emailError } = await resend.emails.send({
          from: 'Football Tournaments UK <noreply@footballtournamentsuk.co.uk>',
          to: [alert.email],
          subject,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email to ${alert.email}:`, emailError);
          
          // Log delivery failure
          await supabase.from('alert_deliveries').insert({
            alert_id: alert.id,
            item_count: matchingTournaments.length,
            status: 'failed',
            error: emailError.message
          });
          
          totalFailed++;
          continue;
        }

        // Update last_sent_at
        await supabase
          .from('tournament_alerts')
          .update({ last_sent_at: now.toISOString() })
          .eq('id', alert.id);

        // Log successful delivery
        await supabase.from('alert_deliveries').insert({
          alert_id: alert.id,
          item_count: matchingTournaments.length,
          status: 'sent'
        });

        totalSent++;
        console.log(`Successfully sent digest to ${alert.email}`);

      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
        totalFailed++;
        
        // Log delivery failure
        await supabase.from('alert_deliveries').insert({
          alert_id: alert.id,
          item_count: 0,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log(`Digest complete: ${totalSent} sent, ${totalFailed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        frequency,
        alerts_processed: alerts.length,
        emails_sent: totalSent,
        emails_failed: totalFailed,
        tournaments_found: tournaments.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in alerts-digest function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});