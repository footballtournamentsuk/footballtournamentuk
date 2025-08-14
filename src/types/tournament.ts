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
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
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