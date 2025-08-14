import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, DatabaseTournament, AgeGroup, TeamType } from '@/types/tournament';

// Transform database tournament to frontend tournament format
export const transformTournament = (dbTournament: DatabaseTournament): Tournament => {
  return {
    id: dbTournament.id,
    name: dbTournament.name,
    description: dbTournament.description || undefined,
    location: {
      name: dbTournament.location_name,
      coordinates: [dbTournament.longitude, dbTournament.latitude],
      postcode: dbTournament.postcode,
      region: dbTournament.region,
    },
    dates: {
      start: new Date(dbTournament.start_date),
      end: new Date(dbTournament.end_date),
      registrationDeadline: dbTournament.registration_deadline 
        ? new Date(dbTournament.registration_deadline) 
        : undefined,
    },
    format: dbTournament.format as '3v3' | '5v5' | '7v7' | '9v9' | '11v11',
    ageGroups: dbTournament.age_groups as AgeGroup[],
    teamTypes: dbTournament.team_types as TeamType[],
    type: dbTournament.type as 'league' | 'tournament' | 'camp' | 'holiday',
    status: dbTournament.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    maxTeams: dbTournament.max_teams || undefined,
    registeredTeams: dbTournament.registered_teams || undefined,
    cost: dbTournament.cost_amount ? {
      amount: dbTournament.cost_amount,
      currency: dbTournament.cost_currency || 'GBP',
    } : undefined,
    contact: {
      name: dbTournament.contact_name,
      email: dbTournament.contact_email,
      phone: dbTournament.contact_phone || undefined,
    },
    website: dbTournament.website || undefined,
    features: dbTournament.features || undefined,
    organizerId: dbTournament.organizer_id || undefined,
  };
};

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      const transformedTournaments = data.map(transformTournament);
      setTournaments(transformedTournaments);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return {
    tournaments,
    loading,
    error,
    refetch: fetchTournaments,
  };
};