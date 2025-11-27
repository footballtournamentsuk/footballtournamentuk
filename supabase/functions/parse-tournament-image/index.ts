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

    const systemPrompt = `You are a tournament data extraction expert. Extract ALL tournament information from the provided image with MAXIMUM ACCURACY.

CRITICAL EXTRACTION RULES:

📅 DATES (MOST IMPORTANT):
- Look for EXACT dates in formats: DD/MM/YYYY, DD-MM-YYYY, "29th December", "Dec 29", etc.
- If you see a single date, check if there's a time range (e.g., "9am-5pm") - that's a one-day event
- If you see "29-30 December", that's TWO DAYS: start_date = 29th, end_date = 30th
- Start date and end date CAN BE DIFFERENT - look carefully!
- NEVER assume dates are the same unless explicitly shown as single date
- Format MUST be ISO 8601: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
- If only year/month given, use 1st day of that month

⚽ FORMATS (EXTRACT ALL):
- Look for ALL format mentions: "U8s play 5v5", "U10s play 7v7", etc.
- If MULTIPLE formats mentioned, choose the MOST COMMON or PRIMARY one for 'format' field
- Add ALL formats to 'additional_notes' like: "Under 8s play 5v5, Under 10s and Under 12s play 7v7"
- Valid formats: "3v3", "5v5", "7v7", "9v9", "11v11"

📍 LOCATION (CRITICAL FOR MAP PINS):
- Extract FULL venue name exactly as shown
- Extract UK POSTCODE if visible (format: AB12 3CD)
- Extract city/town name
- For region: use UK county name (Yorkshire, Lancashire, Greater Manchester, etc.)
- If address is visible, extract it completely

💰 COSTS:
- Look for entry fees, costs per team, registration fees
- Extract numeric amount and currency (usually GBP/£)

👥 CONTACT INFO:
- Extract name, email, phone EXACTLY as shown
- Email addresses are often in lowercase with @ symbol
- Phone numbers may have spaces or dashes

📋 OTHER DETAILS:
- Age groups: U7, U8, U9, U10, U11, U12, U13, U14, U15, U16, U17, U18, U19, U21, Adult
- Team types: Boys, Girls, Mixed
- Type: tournament, league, cup, friendly, festival, camp, showcase
- Max teams if mentioned
- Registration deadline if shown

⚠️ IMPORTANT: DO NOT guess or invent data. Only extract what is CLEARLY VISIBLE in the image.`;

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

    // Geocode the location with Mapbox API
    const MAPBOX_PUBLIC_TOKEN = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    let latitude = 51.5074; // Default to London if geocoding fails
    let longitude = -0.1278;

    if (MAPBOX_PUBLIC_TOKEN && extractedData.location_name) {
      try {
        console.log('📍 Geocoding location:', extractedData.location_name);
        
        // Build search query - prioritize postcode for accuracy
        let searchQuery: string;
        if (extractedData.postcode) {
          // Postcode is most accurate
          searchQuery = `${extractedData.postcode}, United Kingdom`;
          console.log('🎯 Using postcode for geocoding:', searchQuery);
        } else {
          // Fallback to venue + region
          searchQuery = `${extractedData.location_name}, ${extractedData.region}, United Kingdom`;
          console.log('📌 Using venue + region for geocoding:', searchQuery);
        }
        
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_PUBLIC_TOKEN}&country=GB&types=postcode,place,address,poi&limit=1`;
        
        const geocodeResponse = await fetch(geocodeUrl);
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.features && geocodeData.features.length > 0) {
            const feature = geocodeData.features[0];
            [longitude, latitude] = feature.center;
            console.log('✅ Geocoded successfully:', { 
              latitude, 
              longitude,
              place_name: feature.place_name,
              relevance: feature.relevance
            });
          } else {
            console.warn('⚠️ No geocoding results found for:', searchQuery);
          }
        } else {
          console.error('❌ Geocoding API error:', geocodeResponse.status);
        }
      } catch (error) {
        console.error('⚠️ Geocoding failed:', error);
      }
    } else {
      console.warn('⚠️ Mapbox token or location missing, using default coordinates');
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
