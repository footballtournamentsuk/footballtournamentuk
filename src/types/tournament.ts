export interface Tournament {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  location: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    postcode: string;
    region: string;
    country: string; // Added country field
  };
  dates: {
    start: Date;
    end: Date;
    registrationDeadline?: Date;
  };
  format: string; // Can be single format or comma-separated formats like "3v3,5v5,7v7"
  ageGroups: AgeGroup[];
  teamTypes: TeamType[];
  league?: League;
  type: string;
  status: 'upcoming' | 'ongoing' | 'today' | 'tomorrow' | 'registration_open' | 'registration_closes_soon' | 'registration_closed' | 'completed' | 'cancelled';
  maxTeams?: number;
  registeredTeams?: number;
  cost?: {
    amount: number;
    currency: string;
  };
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  website?: string;
  features?: string[];
  organizerId?: string;
  banner_url?: string;
  banner_position?: string;
  share_cover_url?: string;
  share_cover_alt?: string;
  share_cover_variant?: 'FB_1200x630' | 'IG_1080x1350' | 'IG_1080x1080';
  extended_description?: string;
  venue_details?: string;
  rules_and_regulations?: string;
  what_to_bring?: string;
  accommodation_info?: string;
  gallery_images?: string[];
  sponsor_info?: string;
  schedule_details?: string;
  prize_information?: string;
  additional_notes?: string;
}

// Form-specific interface that matches the flat structure used in Profile.tsx
export interface TournamentFormData {
  id?: string;
  name: string;
  description?: string;
  location_name: string;
  postcode: string;
  region: string;
  country?: string; // Added country field
  format: string[];
  age_groups: AgeGroup[];
  team_types: TeamType[];
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  max_teams?: number;
  cost_amount?: number;
  cost_currency: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  features?: string[];
  latitude?: number;
  longitude?: number;
}

// Database tournament type from Supabase
export interface DatabaseTournament {
  id: string;
  slug?: string | null;
  name: string;
  description: string | null;
  location_name: string;
  latitude: number;
  longitude: number;
  postcode: string;
  region: string;
  country: string; // Added country field
  format: string;
  age_groups: string[];
  team_types: string[];
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  max_teams: number | null;
  registered_teams: number | null;
  cost_amount: number | null;
  cost_currency: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  features: string[] | null;
  organizer_id: string | null;
  computed_status: string | null;
  banner_url: string | null;
  banner_position: string | null;
  share_cover_url: string | null;
  share_cover_alt: string | null;
  share_cover_variant: string | null;
  extended_description: string | null;
  venue_details: string | null;
  rules_and_regulations: string | null;
  what_to_bring: string | null;
  accommodation_info: string | null;
  gallery_images: string[] | null;
  sponsor_info: string | null;
  schedule_details: string | null;
  prize_information: string | null;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AgeGroup = 'U6' | 'U7' | 'U8' | 'U9' | 'U10' | 'U11' | 'U12' | 'U13' | 'U14' | 'U15' | 'U16' | 'U17' | 'U18' | 'U19' | 'U20' | 'U21';

export type TeamType = 'boys' | 'girls' | 'mixed';

export interface League {
  id: string;
  name: string;
  region: string;
  website?: string;
}

export interface TournamentFilters {
  search?: string;
  location?: {
    postcode?: string;
    coordinates?: [number, number]; // [longitude, latitude]
    radius?: number; // in miles
  };
  format?: string[];
  ageGroups?: AgeGroup[];
  teamTypes?: TeamType[];
  leagues?: string[];
  regions?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  priceRange?: {
    min?: number;
    max?: number;
    includeFree?: boolean;
  };
  type?: string[];
  status?: string[];
}