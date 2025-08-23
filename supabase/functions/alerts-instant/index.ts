import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface Tournament {
  id: string;
  name: string;
  slug: string | null;
  location_name: string;
  region: string;
  postcode: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  format: string;
  age_groups: string[];
  team_types: string[];
  type: string;
  cost_amount: number | null;
  cost_currency: string;
  max_teams: number | null;
  registered_teams: number;
  status: string;
  computed_status: string | null;
  description: string | null;
  contact_email: string;
  contact_name: string;
  created_at: string;
  updated_at: string;
}

interface Alert {
  id: string;
  email: string;
  filters: any;
  frequency: string;
  is_active: boolean;
  verified_at: string | null;
  management_token: string;
}

// Distance calculation function (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Check if tournament matches alert filters
const matchesTournamentFilters = (tournament: Tournament, filters: any): boolean => {
  // Parse filters if they're stored as strings
  let parsedFilters = filters;
  if (typeof filters === 'string') {
    try {
      parsedFilters = JSON.parse(filters);
    } catch (e) {
      console.warn('Failed to parse filters:', e);
      return false;
    }
  }

  // Search query filter
  if (parsedFilters.search) {
    const searchTerm = parsedFilters.search.toLowerCase();
    const searchableText = [
      tournament.name,
      tournament.description,
      tournament.location_name,
      tournament.region
    ].filter(Boolean).join(' ').toLowerCase();
    
    if (!searchableText.includes(searchTerm)) {
      return false;
    }
  }

  // Location and radius filter
  if (parsedFilters.location) {
    const location = parsedFilters.location;
    
    if (location.postcode && location.latitude && location.longitude) {
      const distance = calculateDistance(
        location.latitude, location.longitude,
        tournament.latitude, tournament.longitude
      );
      const radius = location.radius || 50; // Default 50 miles
      
      if (distance > radius) {
        return false;
      }
    } else if (location.city) {
      // City-based filter
      if (!tournament.location_name.toLowerCase().includes(location.city.toLowerCase()) &&
          !tournament.region.toLowerCase().includes(location.city.toLowerCase())) {
        return false;
      }
    }
  }

  // City filter (from Hero/city pages)
  if (parsedFilters.city) {
    if (!tournament.location_name.toLowerCase().includes(parsedFilters.city.toLowerCase()) &&
        !tournament.region.toLowerCase().includes(parsedFilters.city.toLowerCase())) {
      return false;
    }
  }

  // Format filter
  if (parsedFilters.format && parsedFilters.format.length > 0) {
    if (!parsedFilters.format.includes(tournament.format)) {
      return false;
    }
  }

  // Age groups filter
  if (parsedFilters.ageGroups && parsedFilters.ageGroups.length > 0) {
    if (!parsedFilters.ageGroups.some((age: string) => tournament.age_groups.includes(age))) {
      return false;
    }
  }

  // Team types filter
  if (parsedFilters.teamTypes && parsedFilters.teamTypes.length > 0) {
    if (!parsedFilters.teamTypes.some((type: string) => tournament.team_types.includes(type))) {
      return false;
    }
  }

  // Tournament type filter
  if (parsedFilters.type && parsedFilters.type.length > 0) {
    if (!parsedFilters.type.includes(tournament.type)) {
      return false;
    }
  }

  // Regions filter
  if (parsedFilters.regions && parsedFilters.regions.length > 0) {
    if (!parsedFilters.regions.includes(tournament.region)) {
      return false;
    }
  }

  // Price range filter
  if (parsedFilters.priceRange || parsedFilters.minPrice !== undefined || parsedFilters.maxPrice !== undefined) {
    const priceRange = parsedFilters.priceRange || {};
    const min = priceRange.min ?? parsedFilters.minPrice;
    const max = priceRange.max ?? parsedFilters.maxPrice;
    const includeFree = priceRange.includeFree;
    
    const tournamentPrice = tournament.cost_amount || 0;
    
    if (includeFree && tournamentPrice === 0) {
      // Include free tournaments
    } else if (min !== undefined && tournamentPrice < min) {
      return false;
    } else if (max !== undefined && tournamentPrice > max) {
      return false;
    }
  }

  // Date range filter
  if (parsedFilters.dateRange) {
    const tournamentStart = new Date(tournament.start_date);
    const tournamentEnd = new Date(tournament.end_date);
    
    if (parsedFilters.dateRange.start) {
      const filterStart = new Date(parsedFilters.dateRange.start);
      if (tournamentEnd < filterStart) {
        return false;
      }
    }
    
    if (parsedFilters.dateRange.end) {
      const filterEnd = new Date(parsedFilters.dateRange.end);
      if (tournamentStart > filterEnd) {
        return false;
      }
    }
  }

  return true;
};

// Check rate limits for instant notifications
const checkInstantRateLimit = async (email: string): Promise<boolean> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count } = await supabase
    .from('alert_deliveries')
    .select('*', { count: 'exact', head: true })
    .eq('alert_id', email) // Using alert_id as email identifier for instant notifications
    .gte('sent_at', today.toISOString())
    .eq('status', 'delivered');
    
  return (count || 0) < 3; // Max 3 instant emails per day
};

// Check if tournament has already been sent for this alert
const checkDuplicateDelivery = async (alertId: string, tournamentId: string): Promise<boolean> => {
  const { count } = await supabase
    .from('alert_deliveries')
    .select('*', { count: 'exact', head: true })
    .eq('alert_id', alertId)
    .like('error', `%${tournamentId}%`) // Store tournament ID in error field for tracking
    .eq('status', 'delivered');
    
  return (count || 0) === 0; // True if not delivered before
};

// Generate instant notification email
const generateInstantEmail = (tournament: Tournament, alert: Alert): string => {
  const tournamentUrl = `https://footballtournamentsuk.co.uk/tournaments/${tournament.slug || tournament.id}`;
  const manageUrl = `https://footballtournamentsuk.co.uk/alerts/manage/${alert.management_token}`;
  const unsubscribeUrl = `https://footballtournamentsuk.co.uk/alerts/unsubscribe?token=${alert.management_token}`;
  
  const startDate = new Date(tournament.start_date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const endDate = new Date(tournament.end_date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const dateRange = tournament.start_date === tournament.end_date ? startDate : `${startDate} - ${endDate}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Tournament Alert</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin-bottom: 10px;">🏆 Football Tournaments UK</h1>
          <h2 style="color: #374151; font-weight: 600;">New Tournament Alert</h2>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #059669; margin: 0 0 10px 0;">📢 A new tournament matching your criteria has been added!</h3>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #374151; margin: 0 0 16px 0; font-size: 24px;">${tournament.name}</h2>
          
          <div style="margin-bottom: 16px;">
            <p style="margin: 8px 0; color: #6b7280;"><strong>📅 Date:</strong> ${dateRange}</p>
            <p style="margin: 8px 0; color: #6b7280;"><strong>📍 Location:</strong> ${tournament.location_name}, ${tournament.region}</p>
            <p style="margin: 8px 0; color: #6b7280;"><strong>⚽ Format:</strong> ${tournament.format}</p>
            <p style="margin: 8px 0; color: #6b7280;"><strong>👥 Age Groups:</strong> ${tournament.age_groups.join(', ')}</p>
            <p style="margin: 8px 0; color: #6b7280;"><strong>🏆 Type:</strong> ${tournament.type}</p>
            ${tournament.cost_amount ? 
              `<p style="margin: 8px 0; color: #6b7280;"><strong>💰 Cost:</strong> £${tournament.cost_amount}</p>` : 
              `<p style="margin: 8px 0; color: #6b7280;"><strong>💰 Cost:</strong> Free</p>`
            }
            ${tournament.registration_deadline ? 
              `<p style="margin: 8px 0; color: #6b7280;"><strong>⏰ Registration Deadline:</strong> ${new Date(tournament.registration_deadline).toLocaleDateString('en-GB')}</p>` : 
              ''
            }
          </div>
          
          ${tournament.description ? 
            `<div style="margin: 16px 0; padding: 16px; background: #f9fafb; border-radius: 6px;">
              <p style="margin: 0; color: #374151;">${tournament.description}</p>
            </div>` : 
            ''
          }
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${tournamentUrl}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              🏆 View Tournament Details
            </a>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
          <p style="margin: 0 0 16px 0;">
            <strong>Contact:</strong> ${tournament.contact_name} - ${tournament.contact_email}
          </p>
          
          <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">Manage Your Alerts:</p>
            <p style="margin: 0 0 8px 0;">
              <a href="${manageUrl}" style="color: #059669; text-decoration: none;">🔧 Update alert preferences</a>
            </p>
            <p style="margin: 0;">
              <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: none;">❌ Unsubscribe from all alerts</a>
            </p>
          </div>
          
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
            You received this because you have an instant tournament alert set up. 
            This is an automated message - please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
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
    const { tournamentId, action = 'created' } = await req.json();

    if (!tournamentId) {
      return new Response(
        JSON.stringify({ error: 'Tournament ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing instant alerts for tournament:', tournamentId, 'action:', action);

    // Get the tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      console.error('Error fetching tournament:', tournamentError);
      return new Response(
        JSON.stringify({ error: 'Tournament not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all active instant alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('tournament_alerts')
      .select('*')
      .eq('frequency', 'instant')
      .eq('is_active', true)
      .not('verified_at', 'is', null);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch alerts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!alerts || alerts.length === 0) {
      console.log('No active instant alerts found');
      return new Response(
        JSON.stringify({ message: 'No active instant alerts found', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const results = [];

    for (const alert of alerts) {
      try {
        // Check if tournament matches alert filters
        if (!matchesTournamentFilters(tournament, alert.filters)) {
          console.log(`Tournament ${tournamentId} doesn't match filters for alert ${alert.id}`);
          continue;
        }

        // Check rate limit (max 3 instant emails per day)
        const canSend = await checkInstantRateLimit(alert.email);
        if (!canSend) {
          console.log(`Rate limit exceeded for email ${alert.email}`);
          results.push({ 
            alertId: alert.id, 
            email: alert.email, 
            status: 'rate_limited' 
          });
          continue;
        }

        // Check for duplicate delivery
        const isUnique = await checkDuplicateDelivery(alert.id, tournamentId);
        if (!isUnique) {
          console.log(`Tournament ${tournamentId} already sent to alert ${alert.id}`);
          results.push({ 
            alertId: alert.id, 
            email: alert.email, 
            status: 'duplicate' 
          });
          continue;
        }

        // Generate and send email
        const emailHtml = generateInstantEmail(tournament, alert);
        
        const { error: emailError } = await resend.emails.send({
          from: 'Football Tournaments UK <alerts@footballtournamentsuk.co.uk>',
          to: [alert.email],
          subject: `🏆 New Tournament Alert: ${tournament.name}`,
          html: emailHtml,
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
          
          // Log failed delivery
          await supabase.from('alert_deliveries').insert({
            alert_id: alert.id,
            item_count: 1,
            status: 'failed',
            error: `Email delivery failed: ${emailError.message} (Tournament: ${tournamentId})`,
            sent_at: new Date().toISOString()
          });
          
          results.push({ 
            alertId: alert.id, 
            email: alert.email, 
            status: 'failed', 
            error: emailError.message 
          });
        } else {
          // Log successful delivery
          await supabase.from('alert_deliveries').insert({
            alert_id: alert.id,
            item_count: 1,
            status: 'delivered',
            error: `Instant notification sent for tournament: ${tournamentId}`,
            sent_at: new Date().toISOString()
          });

          // Update alert last_sent_at
          await supabase
            .from('tournament_alerts')
            .update({ last_sent_at: new Date().toISOString() })
            .eq('id', alert.id);

          sentCount++;
          results.push({ 
            alertId: alert.id, 
            email: alert.email, 
            status: 'sent' 
          });
          
          console.log(`Instant alert sent to ${alert.email} for tournament ${tournament.name}`);
        }
      } catch (error) {
        console.error('Error processing alert:', alert.id, error);
        results.push({ 
          alertId: alert.id, 
          email: alert.email, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    console.log(`Instant alerts processed: ${sentCount} sent out of ${alerts.length} alerts`);

    return new Response(
      JSON.stringify({ 
        message: 'Instant alerts processed',
        sent: sentCount,
        total: alerts.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in alerts-instant function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});