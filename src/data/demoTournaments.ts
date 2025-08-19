import { Tournament, AgeGroup, TeamType } from '@/types/tournament';
import { UK_CITIES } from './cities';

// Demo tournament types array that we'll rotate through
const DEMO_TYPES = ['tournament', 'league', 'cup', 'festival', 'showcase', 'friendly', 'camp'] as const;

// Demo banner images for each city/type combination - using ES6 imports
import tournamentBanner from '@/assets/tournaments/tournament-type.webp';
import leagueBanner from '@/assets/tournaments/league-type.webp';
import cupBanner from '@/assets/tournaments/cup-type.webp';
import festivalBanner from '@/assets/tournaments/festival-type.webp';
import showcaseBanner from '@/assets/tournaments/showcase-type.webp';
import friendlyBanner from '@/assets/tournaments/friendly-type.webp';
import campBanner from '@/assets/tournaments/camp-type.webp';

export const DEMO_BANNER_URLS = {
  'london': tournamentBanner,
  'manchester': leagueBanner,
  'birmingham': cupBanner,
  'liverpool': festivalBanner,
  'leeds': showcaseBanner,
  'newcastle-upon-tyne': friendlyBanner,
  'sheffield': campBanner,
  'bristol': tournamentBanner,
  'nottingham': leagueBanner,
  'southampton': cupBanner,
  'glasgow': festivalBanner,
  'edinburgh': showcaseBanner,
  'cardiff': friendlyBanner,
  'swansea': campBanner,
  'belfast': tournamentBanner,
  'leicester': leagueBanner,
  'portsmouth': cupBanner,
  'brighton': festivalBanner,
  'oxford': showcaseBanner,
  'cambridge': friendlyBanner
} as const;

export const generateDemoTournaments = (): Tournament[] => {
  return UK_CITIES.map((city, index) => {
    const typeIndex = index % DEMO_TYPES.length;
    const eventType = DEMO_TYPES[typeIndex];
    
    // Generate future dates (1-3 months from now)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1 + (index % 3));
    startDate.setDate(15); // Set to middle of month
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (eventType === 'camp' ? 4 : 2));
    
    const registrationDeadline = new Date(startDate);
    registrationDeadline.setDate(startDate.getDate() - 14);
    
    // Rotate formats across cities
    const formats = ['3v3', '5v5', '7v7', '9v9', '11v11'] as const;
    const format = formats[index % formats.length];
    
    // Age groups selection based on format
    const ageGroupsByFormat: Record<string, AgeGroup[]> = {
      '3v3': ['U6', 'U7', 'U8'],
      '5v5': ['U8', 'U9', 'U10'],
      '7v7': ['U10', 'U11', 'U12'],
      '9v9': ['U12', 'U13', 'U14'],
      '11v11': ['U14', 'U15', 'U16']
    };
    
    const ageGroups = ageGroupsByFormat[format];
    
    // Generate generic venue names
    const venueNames = {
      'london': 'Example Sports Centre',
      'manchester': 'Example Sports Centre',
      'birmingham': 'Example Sports Centre',
      'liverpool': 'Example Sports Centre',
      'leeds': 'Example Sports Centre',
      'newcastle-upon-tyne': 'Example Sports Centre',
      'sheffield': 'Example Sports Centre',
      'bristol': 'Example Sports Centre',
      'nottingham': 'Example Sports Centre',
      'southampton': 'Example Sports Centre',
      'glasgow': 'Example Sports Centre',
      'edinburgh': 'Example Sports Centre',
      'cardiff': 'Example Sports Centre',
      'swansea': 'Example Sports Centre',
      'belfast': 'Example Sports Centre',
      'leicester': 'Example Sports Centre',
      'portsmouth': 'Example Sports Centre',
      'brighton': 'Example Sports Centre',
      'oxford': 'Example Sports Centre',
      'cambridge': 'Example Sports Centre'
    };

    const demoTournament: Tournament = {
      id: `demo-${city.slug}`,
      slug: `demo-${city.slug}`,
      name: `${city.displayName} Youth ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
      description: `Experience our premier youth football ${eventType} in ${city.displayName}. This is a demo listing for illustration purposes, showcasing the quality events available in your area.`,
      location: {
        name: venueNames[city.slug as keyof typeof venueNames] || `${city.displayName} Sports Centre`,
        coordinates: city.coordinates,
        postcode: generateDemoPostcode(city.slug),
        region: city.region
      },
      dates: {
        start: startDate,
        end: endDate,
        registrationDeadline: registrationDeadline
      },
      format: format,
      ageGroups: ageGroups,
      teamTypes: ['boys', 'girls', 'mixed'] as TeamType[],
      type: eventType,
      status: 'registration_open',
      maxTeams: eventType === 'camp' ? 60 : 32,
      registeredTeams: Math.floor(Math.random() * 10) + 15, // Random between 15-25
      cost: {
        amount: 0,
        currency: 'GBP'
      },
      contact: {
        name: 'Demo Organizer',
        email: `demo@footballtournamentsuk.co.uk`
      },
      features: generateDemoFeatures(eventType),
      banner_url: DEMO_BANNER_URLS[city.slug as keyof typeof DEMO_BANNER_URLS] || tournamentBanner,
      extended_description: `This is a comprehensive demo listing showcasing what ${eventType} events look like in ${city.displayName}. In the real system, this would contain detailed information about the actual event, including full descriptions, rules, and organizer details.`,
      venue_details: `Located at the heart of ${city.displayName}, this venue offers state-of-the-art facilities perfect for youth football development.`,
      rules_and_regulations: 'Standard FA youth football rules apply. Fair play and respect are emphasized.',
      what_to_bring: 'Football boots, shin pads, water bottle, and team kit.',
      accommodation_info: eventType === 'camp' ? 'Accommodation packages available on request.' : undefined,
      prize_information: 'Trophies for winners, medals for all participants, and certificates of achievement.',
      additional_notes: 'This is a demo listing for illustration purposes. Contact us to add your real tournament.',
      // Mark as demo
      organizerId: 'demo',
    };

    return demoTournament;
  });
};

// Generate realistic postcodes for each city
function generateDemoPostcode(citySlug: string): string {
  const postcodes = {
    'london': 'E20 2ST',
    'manchester': 'M16 0RA',
    'birmingham': 'B6 6HE',
    'liverpool': 'L4 0TH',
    'leeds': 'LS11 0ES',
    'newcastle-upon-tyne': 'NE1 4ST',
    'sheffield': 'S2 4SU',
    'bristol': 'BS1 6NU',
    'nottingham': 'NG2 5LU',
    'southampton': 'SO14 0AA',
    'glasgow': 'G40 3RE',
    'edinburgh': 'EH12 9DB',
    'cardiff': 'CF11 9LJ',
    'swansea': 'SA1 2FA',
    'belfast': 'BT9 5GW',
    'leicester': 'LE2 7FL',
    'portsmouth': 'PO4 8RA',
    'brighton': 'BN1 9QJ',
    'oxford': 'OX4 2RD',
    'cambridge': 'CB5 8AB'
  };
  
  return postcodes[citySlug as keyof typeof postcodes] || 'UK1 1AA';
}

// Generate features based on tournament type
function generateDemoFeatures(type: string): string[] {
  const baseFeatures = ['Professional referees', 'First aid on site', 'Parking available'];
  
  const typeSpecificFeatures = {
    tournament: ['Trophies for winners', 'Live streaming', 'Programme available'],
    league: ['Season-long competition', 'League table updates', 'End of season awards'],
    cup: ['Knockout format', 'Medal ceremony', 'Match photography'],
    festival: ['Multiple formats', 'Food court', 'Family entertainment'],
    showcase: ['Scout attendance', 'Player assessments', 'Development feedback'],
    friendly: ['Relaxed atmosphere', 'Skills workshops', 'Fun activities'],
    camp: ['Professional coaching', 'Lunch included', 'Equipment provided', 'Certificate of completion']
  };
  
  return [...baseFeatures, ...(typeSpecificFeatures[type as keyof typeof typeSpecificFeatures] || [])];
}

// Check if a city should show demo tournament (no real tournaments exist)
export const shouldShowDemoForCity = (citySlug: string, realTournaments: Tournament[]): boolean => {
  const city = UK_CITIES.find(c => c.slug === citySlug);
  if (!city) return false;
  
  // Check if any real tournaments exist for this city
  const hasRealTournaments = realTournaments.some(tournament => 
    tournament.location.region === city.region || 
    tournament.location.name.toLowerCase().includes(city.displayName.toLowerCase())
  );
  
  return !hasRealTournaments;
};