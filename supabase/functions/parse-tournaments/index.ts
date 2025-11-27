import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedTournament {
  name: string;
  description: string;
  location_name: string;
  postcode: string;
  region: string;
  start_date: string;
  end_date: string;
  format: string[];
  age_groups: string[];
  team_types: string[];
  type: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  cost_amount?: number;
  cost_currency?: string;
  registration_deadline?: string;
  venue_details?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('🔍 Fetching tournament data from:', url);

    // Fetch the website content
    const websiteResponse = await fetch(url);
    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.statusText}`);
    }
    
    const html = await websiteResponse.text();
    console.log('✅ Website content fetched, length:', html.length);

    // Use Lovable AI to extract structured tournament data
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🤖 Extracting tournament data with AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a tournament data extraction assistant. Extract youth football tournament information from UK County FA websites. 
            
CRITICAL RULES:
- Only extract UPCOMING tournaments (start_date must be in the future)
- IGNORE any past tournaments completely
- Format dates as ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
- If multiple tournaments found, return array of all UPCOMING ones
- Set region to UK county name (e.g., "Greater London", "Yorkshire", "Lancashire")
- Format must be array of one or more: ["3v3", "5v5", "7v7", "9v9", "11v11"]
- Age groups must be array of format ["U7", "U8", "U9", etc.]
- Team types must be array: ["boys", "girls", "mixed"]
- Type must be one of: "tournament", "league", "cup", "festival", "showcase", "friendly", "camp", "holiday"
- If cost not found, omit cost_amount and cost_currency fields
- Contact email is REQUIRED - skip tournament if not found
- Postcode must be valid UK format (e.g., "SW1A 1AA")

Return ONLY valid JSON, no markdown formatting.`
          },
          {
            role: 'user',
            content: `Extract ALL upcoming tournament information from this HTML. Return array of tournaments or single tournament object if only one found:\n\n${html.substring(0, 15000)}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_tournaments",
            description: "Extract upcoming football tournament data from website",
            parameters: {
              type: "object",
              properties: {
                tournaments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      location_name: { type: "string" },
                      postcode: { type: "string" },
                      region: { type: "string" },
                      start_date: { type: "string" },
                      end_date: { type: "string" },
                      format: { type: "array", items: { type: "string" } },
                      age_groups: { type: "array", items: { type: "string" } },
                      team_types: { type: "array", items: { type: "string" } },
                      type: { type: "string" },
                      contact_name: { type: "string" },
                      contact_email: { type: "string" },
                      contact_phone: { type: "string" },
                      website: { type: "string" },
                      cost_amount: { type: "number" },
                      cost_currency: { type: "string" },
                      registration_deadline: { type: "string" },
                      venue_details: { type: "string" }
                    },
                    required: ["name", "location_name", "postcode", "region", "start_date", "end_date", "format", "age_groups", "team_types", "type", "contact_name", "contact_email"]
                  }
                }
              },
              required: ["tournaments"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_tournaments" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API failed: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('🎯 AI response received');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tournament data extracted from AI response');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    const tournaments = extractedData.tournaments || [];

    console.log(`📋 Extracted ${tournaments.length} tournaments`);

    // Filter only upcoming tournaments
    const now = new Date();
    const upcomingTournaments = tournaments.filter((t: ParsedTournament) => {
      const startDate = new Date(t.start_date);
      return startDate > now;
    });

    console.log(`✅ ${upcomingTournaments.length} upcoming tournaments after filtering`);

    if (upcomingTournaments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No upcoming tournaments found on this page',
          extracted: tournaments.length,
          upcoming: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Geocode addresses and save tournaments
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    const savedTournaments = [];
    const errors = [];

    for (const tournament of upcomingTournaments) {
      try {
        console.log(`📍 Geocoding: ${tournament.location_name}, ${tournament.postcode}`);

        // Geocode the address
        let latitude = 51.5074; // Default to London
        let longitude = -0.1278;

        if (MAPBOX_TOKEN) {
          const geocodeQuery = encodeURIComponent(`${tournament.location_name}, ${tournament.postcode}, ${tournament.region}, UK`);
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${geocodeQuery}.json?access_token=${MAPBOX_TOKEN}&country=GB&limit=1`;
          
          const geocodeResponse = await fetch(geocodeUrl);
          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.features && geocodeData.features.length > 0) {
              [longitude, latitude] = geocodeData.features[0].center;
              console.log(`✅ Geocoded to: ${latitude}, ${longitude}`);
            }
          }
        }

        // Insert tournament as unpublished
        const { data, error } = await supabase
          .from('tournaments')
          .insert({
            name: tournament.name,
            description: tournament.description,
            location_name: tournament.location_name,
            postcode: tournament.postcode,
            region: tournament.region,
            country: 'GB',
            latitude,
            longitude,
            start_date: tournament.start_date,
            end_date: tournament.end_date,
            format: tournament.format.join(','),
            age_groups: tournament.age_groups,
            team_types: tournament.team_types,
            type: tournament.type,
            contact_name: tournament.contact_name,
            contact_email: tournament.contact_email,
            contact_phone: tournament.contact_phone,
            website: tournament.website || url,
            cost_amount: tournament.cost_amount,
            cost_currency: tournament.cost_currency || 'GBP',
            registration_deadline: tournament.registration_deadline,
            venue_details: tournament.venue_details,
            status: 'upcoming',
            is_published: false, // Requires admin approval
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Failed to save tournament:', error);
          errors.push({ tournament: tournament.name, error: error.message });
        } else {
          console.log('✅ Saved tournament:', tournament.name);
          savedTournaments.push(data);
        }
      } catch (err) {
        console.error('❌ Error processing tournament:', err);
        errors.push({ tournament: tournament.name, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully parsed ${savedTournaments.length} tournaments`,
        saved: savedTournaments.length,
        errors: errors.length > 0 ? errors : undefined,
        tournaments: savedTournaments
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in parse-tournaments function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
