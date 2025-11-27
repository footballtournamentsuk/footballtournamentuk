import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedTournamentFromImage {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location_name: string;
  postcode?: string;
  region: string;
  country: string;
  type: string;
  format: string;
  age_groups: string[];
  team_types: string[];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  registration_deadline?: string;
  cost_amount?: number;
  cost_currency?: string;
  max_teams?: number;
  venue_details?: string;
  additional_notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    console.log('🖼️ Processing tournament image...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a tournament data extraction expert. Extract ALL tournament information from the provided image.

CRITICAL EXTRACTION RULES:
1. Extract the EXACT tournament name as it appears
2. Dates MUST be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
3. If only month/year is shown, use the 1st day of that month
4. Extract ALL contact information (name, email, phone, website)
5. Region must be a UK county name (e.g., "Yorkshire", "Lancashire", "Greater London")
6. Country default to "GB" for UK events
7. Age groups must use format: "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U21", "Adult"
8. Team types must be one or more of: ["Boys", "Girls", "Mixed"]
9. Format must be one of: ["3v3", "5v5", "7v7", "9v9", "11v11"]
10. Type must be one of: ["tournament", "league", "cup", "friendly", "festival", "camp", "showcase"]
11. Extract venue/location details if visible
12. Extract costs/fees if mentioned
13. Extract maximum team capacity if shown
14. Extract registration deadline if mentioned

If information is not visible or unclear, omit that field - DO NOT guess or invent data.`;

    console.log('🤖 Sending image to Lovable AI for extraction...');

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all tournament information from this image and return it in the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_tournament_data',
              description: 'Extract structured tournament data from image',
              parameters: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Tournament name' },
                  description: { type: 'string', description: 'Tournament description' },
                  start_date: { type: 'string', description: 'Start date in ISO 8601 format' },
                  end_date: { type: 'string', description: 'End date in ISO 8601 format' },
                  location_name: { type: 'string', description: 'Venue or city name' },
                  postcode: { type: 'string', description: 'UK postcode' },
                  region: { type: 'string', description: 'UK county name' },
                  country: { type: 'string', description: 'Country code (GB for UK)' },
                  type: { type: 'string', enum: ['tournament', 'league', 'cup', 'friendly', 'festival', 'camp', 'showcase'] },
                  format: { type: 'string', enum: ['3v3', '5v5', '7v7', '9v9', '11v11'] },
                  age_groups: { type: 'array', items: { type: 'string' }, description: 'Age groups (U7-U21, Adult)' },
                  team_types: { type: 'array', items: { type: 'string' }, description: 'Boys/Girls/Mixed' },
                  contact_name: { type: 'string', description: 'Contact person name' },
                  contact_email: { type: 'string', description: 'Contact email' },
                  contact_phone: { type: 'string', description: 'Contact phone' },
                  website: { type: 'string', description: 'Website URL' },
                  registration_deadline: { type: 'string', description: 'Registration deadline in ISO 8601' },
                  cost_amount: { type: 'number', description: 'Entry fee amount' },
                  cost_currency: { type: 'string', description: 'Currency code (GBP)' },
                  max_teams: { type: 'number', description: 'Maximum teams' },
                  venue_details: { type: 'string', description: 'Venue details' },
                  additional_notes: { type: 'string', description: 'Additional information' }
                },
                required: ['name', 'start_date', 'end_date', 'location_name', 'region', 'country', 'type', 'format', 'age_groups', 'team_types']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_tournament_data' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI API error:', errorText);
      throw new Error(`AI extraction failed: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('🎯 AI response received');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_tournament_data') {
      throw new Error('AI did not return tournament data');
    }

    const extractedData = JSON.parse(toolCall.function.arguments) as ParsedTournamentFromImage;
    console.log('✅ Extracted data:', extractedData);

    // Validate required fields
    if (!extractedData.name || !extractedData.start_date || !extractedData.end_date) {
      throw new Error('Missing required tournament information in image');
    }

    // Geocode the location
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN');
    let latitude = 51.5074; // Default to London
    let longitude = -0.1278;

    if (MAPBOX_TOKEN && extractedData.location_name) {
      try {
        console.log('📍 Geocoding location:', extractedData.location_name);
        const searchQuery = extractedData.postcode 
          ? `${extractedData.postcode}, UK`
          : `${extractedData.location_name}, ${extractedData.region}, UK`;
        
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&country=GB&limit=1`;
        const geocodeResponse = await fetch(geocodeUrl);
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.features && geocodeData.features.length > 0) {
            [longitude, latitude] = geocodeData.features[0].center;
            console.log('✅ Geocoded:', { latitude, longitude });
          }
        }
      } catch (error) {
        console.error('⚠️ Geocoding failed:', error);
      }
    }

    // Prepare tournament data for database
    const tournamentData = {
      ...extractedData,
      latitude,
      longitude,
      is_published: false, // Always unpublished for admin review
      status: 'upcoming',
      country: extractedData.country || 'GB',
      cost_currency: extractedData.cost_currency || 'GBP',
    };

    console.log('📋 Tournament data prepared for database');

    return new Response(
      JSON.stringify({
        success: true,
        data: tournamentData,
        message: 'Tournament data extracted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error in parse-tournament-image:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to parse tournament image'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
