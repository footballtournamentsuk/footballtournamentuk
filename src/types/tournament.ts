export interface Tournament {
  id: string;
  name: string;
  description?: string;
  location: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    postcode: string;
    region: string;
  };
  dates: {
    start: Date;
    end: Date;
    registrationDeadline?: Date;
  };
  format: '3v3' | '5v5' | '7v7' | '9v9' | '11v11';
  ageGroups: AgeGroup[];
  teamTypes: TeamType[];
  league?: League;
  type: 'league' | 'tournament' | 'camp' | 'holiday';
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
}

// Database tournament type from Supabase
export interface DatabaseTournament {
  id: string;
  name: string;
  description: string | null;
  location_name: string;
  latitude: number;
  longitude: number;
  postcode: string;
  region: string;
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
  format?: string[];
  ageGroups?: AgeGroup[];
  teamTypes?: TeamType[];
  leagues?: string[];
  regions?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  type?: string[];
  status?: string[];
}