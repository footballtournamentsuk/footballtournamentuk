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
    const { imageData, additionalText } = await req.json();
    
    if (!imageData && !additionalText) {
      throw new Error('No image or text data provided');
    }

    console.log('🖼️ Processing tournament data...', {
      hasImage: !!imageData,
      hasText: !!additionalText
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a tournament data extraction expert. Extract ALL tournament information from the provided sources (image and/or text) with MAXIMUM ACCURACY.

CRITICAL EXTRACTION RULES:

📝 DESCRIPTION (IMPORTANT):
- Look for ANY descriptive text about the tournament
- Extract tournament details, highlights, special notes
- Common locations: below title, in info sections, promotional text
- Examples: "Join us for...", "Featuring...", "Great opportunity to..."

📅 DATES (MOST IMPORTANT):
- Look for EXACT dates in formats: DD/MM/YYYY, DD-MM-YYYY, "29th December", "Dec 29", etc.
- If you see a single date, check if there's a time range (e.g., "9am-5pm") - that's a one-day event
- If you see "29-30 December", that's TWO DAYS: start_date = 29th, end_date = 30th
- Start date and end date CAN BE DIFFERENT - look carefully!
- NEVER assume dates are the same unless explicitly shown as single date
- Format MUST be ISO 8601: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
- If only year/month given, use 1st day of that month
- Registration deadline: Look for "Register by", "Deadline", "Close date"

⚽ FORMATS (CRITICAL - READ CAREFULLY):
- FIRST: Look for EXPLICIT format mentions: "U8s play 5v5", "U10s play 7v7", "Format: 7v7", etc.
- IF NO EXPLICIT FORMATS: Use standard UK youth football formats by age:
  * U7-U8: use "5v5"
  * U9-U10: use "7v7"  
  * U11-U12: use "9v9"
  * U13+: use "11v11"
- IF MULTIPLE AGE GROUPS WITH DIFFERENT FORMATS:
  * Set 'format' field to the MOST COMMON format across all age groups
  * Example: U7,U8,U9,U10,U11,U12 → Most common would be "7v7" (covers U9,U10,U11,U12)
  * ALWAYS add detailed format breakdown to 'additional_notes':
    "U7-U8 play 5v5, U9-U10 play 7v7, U11-U12 play 9v9, U13+ play 11v11"
- Valid formats: "3v3", "5v5", "7v7", "9v9", "11v11"

📍 LOCATION (CRITICAL - FOLLOW EXACTLY):
**LOCATION_NAME MUST ALWAYS INCLUDE CITY:**
- Format: "Venue Name, City Name" 
- ✅ CORRECT: "Amory Park, Tiverton" (venue + city)
- ✅ CORRECT: "Wembley Stadium, London" (venue + city)
- ❌ WRONG: "Amory Park" (missing city)
- ❌ WRONG: "Tiverton" (missing venue)

**EXTRACTION RULES:**
- If text says "Amory Park, Tiverton" → location_name = "Amory Park, Tiverton"
- If text says "at Wembley Stadium in London" → location_name = "Wembley Stadium, London"
- Extract UK POSTCODE if visible (format: AB12 3CD)
- For region: use UK county name (Devon, Yorkshire, Lancashire, etc.)

**EXAMPLE OUTPUT:**
- location_name: "Amory Park, Tiverton"
- region: "Devon"  
- postcode: "EX16 4ER"

💰 COSTS (CRITICAL - ALWAYS LOOK FOR THESE):
- Look for: "Entry fee", "Cost per team", "Price", "£XX", "$XX", "€XX"
- Common locations: near title, in info boxes, with "COST:" or "ENTRY:" labels
- Extract numeric amount (e.g., 450 from "£450")
- Currency: GBP (£), EUR (€), or USD ($)
- Look for phrases: "Cost: £450", "Entry: £50 per team", "Price £100"

👥 CONTACT INFO:
- Extract name, email, phone EXACTLY as shown
- Email addresses are often in lowercase with @ symbol
- Phone numbers may have spaces or dashes

📋 OTHER DETAILS:
- Age groups: U7, U8, U9, U10, U11, U12, U13, U14, U15, U16, U17, U18, U19, U21, Adult
- Team types: Boys, Girls, Mixed
- Type: tournament, league, cup, friendly, festival, camp, showcase
- Max teams: Look for "Maximum teams", "Limited to X teams", "XX teams only"
- Registration deadline if shown

⚠️ IMPORTANT: 
- If both image and text are provided, COMBINE information from both sources
- Text description may contain more detailed information than the image
- DO NOT guess or invent data. Only extract what is CLEARLY VISIBLE/STATED.`;

    console.log('🤖 Sending data to Lovable AI for extraction...');

    // Build user message content
    const userContent: any[] = [];
    
    // Add text if provided
    if (additionalText) {
      userContent.push({
        type: 'text',
        text: `Additional text description:\n\n${additionalText}\n\n---\n\nExtract all tournament information from the text above${imageData ? ' and the image below' : ''}.`
      });
    } else {
      userContent.push({
        type: 'text',
        text: 'Extract all tournament information from this image and return it in the specified JSON format.'
      });
    }
    
    // Add image if provided
    if (imageData) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: imageData
        }
      });
    }

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
            content: userContent
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
                  location_name: { type: 'string', description: 'MUST be format "Venue Name, City Name" - e.g. "Amory Park, Tiverton"' },
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
    let finalPostcode = extractedData.postcode;

    if (MAPBOX_PUBLIC_TOKEN && extractedData.location_name) {
      try {
        console.log('📍 Geocoding location:', extractedData.location_name);
        
        // Build precise search query for maximum accuracy
        // Priority: exact venue + city + postcode (if available) + country
        const queryParts = [extractedData.location_name]; // e.g., "Amory Park, Tiverton"
        
        if (extractedData.postcode) {
          queryParts.push(extractedData.postcode);
        }
        
        // Add region for additional context if available
        if (extractedData.region) {
          queryParts.push(extractedData.region);
        }
        
        queryParts.push('United Kingdom');
        
        const searchQuery = queryParts.join(', ');
        console.log('🎯 Precise geocoding query:', searchQuery);
        
        // Use poi,place,address order to prioritize specific venues over generic locations
        // Add fuzzyMatch=false for more precise results
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_PUBLIC_TOKEN}&country=GB&types=poi,place,address&fuzzyMatch=false&limit=1`;
        
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

            // Always perform reverse geocoding to get the most accurate postcode for the exact coordinates
            // This ensures we get the venue-specific postcode even if it wasn't in the source text
            console.log('🔄 Performing reverse geocoding for precise postcode...');
            try {
              const reverseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_PUBLIC_TOKEN}&types=address,poi&limit=1`;
              const reverseResponse = await fetch(reverseUrl);
              
              if (reverseResponse.ok) {
                const reverseData = await reverseResponse.json();
                if (reverseData.features && reverseData.features.length > 0) {
                  const feature = reverseData.features[0];
                  // Extract postcode from the context array (Mapbox includes postcode in address context)
                  const postcodeContext = feature.context?.find((c: any) => c.id.startsWith('postcode'));
                  if (postcodeContext) {
                    finalPostcode = postcodeContext.text;
                    console.log('✅ Precise postcode from coordinates:', finalPostcode);
                  } else if (!finalPostcode) {
                    // Fallback: extract from place_name if no context postcode
                    const placeNameParts = feature.place_name.split(',');
                    const postcodeMatch = placeNameParts.find((part: string) => /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i.test(part.trim()));
                    if (postcodeMatch) {
                      finalPostcode = postcodeMatch.trim();
                      console.log('✅ Postcode extracted from place_name:', finalPostcode);
                    }
                  }
                }
              }
            } catch (reverseError) {
              console.error('⚠️ Reverse geocoding failed:', reverseError);
            }
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
      postcode: finalPostcode,
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
