import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, DatabaseTournament, AgeGroup, TeamType } from '@/types/tournament';
import { generateDemoTournaments, shouldShowDemoForCity } from '@/data/demoTournaments';

// Transform database tournament to frontend tournament format
export const transformTournament = (dbTournament: DatabaseTournament): Tournament => {
  // Calculate status based on dates if computed_status is not available
  const now = new Date();
  const startDate = new Date(dbTournament.start_date);
  const endDate = new Date(dbTournament.end_date);
  
  let calculatedStatus = dbTournament.computed_status || dbTournament.status;
  
  // If no computed status, calculate based on dates
  if (!dbTournament.computed_status) {
    if (now > endDate) {
      calculatedStatus = 'completed';
    } else if (now >= startDate && now <= endDate) {
      calculatedStatus = 'ongoing';
    } else if (startDate > now) {
      calculatedStatus = 'upcoming';
    }
  }

  return {
    id: dbTournament.id,
    slug: dbTournament.slug || undefined,
    name: dbTournament.name,
    description: dbTournament.description || undefined,
    location: {
      name: dbTournament.location_name,
      coordinates: [dbTournament.longitude, dbTournament.latitude],
      postcode: dbTournament.postcode,
      region: dbTournament.region,
      country: dbTournament.country || 'GB', // Add country field with fallback
    },
    dates: {
      start: new Date(dbTournament.start_date),
      end: new Date(dbTournament.end_date),
      registrationDeadline: dbTournament.registration_deadline 
        ? new Date(dbTournament.registration_deadline) 
        : undefined,
    },
    format: dbTournament.format,
    ageGroups: dbTournament.age_groups as AgeGroup[],
    teamTypes: dbTournament.team_types as TeamType[],
    type: dbTournament.type,
    status: calculatedStatus as 'upcoming' | 'ongoing' | 'today' | 'tomorrow' | 'registration_open' | 'registration_closes_soon' | 'registration_closed' | 'completed' | 'cancelled',
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
    banner_url: dbTournament.banner_url || undefined,
    share_cover_url: dbTournament.share_cover_url || undefined,
    share_cover_alt: dbTournament.share_cover_alt || undefined,
    share_cover_variant: (dbTournament.share_cover_variant as 'FB_1200x630' | 'IG_1080x1350' | 'IG_1080x1080') || 'FB_1200x630',
    extended_description: dbTournament.extended_description || undefined,
    venue_details: dbTournament.venue_details || undefined,
    rules_and_regulations: dbTournament.rules_and_regulations || undefined,
    what_to_bring: dbTournament.what_to_bring || undefined,
    accommodation_info: dbTournament.accommodation_info || undefined,
    gallery_images: dbTournament.gallery_images || undefined,
    sponsor_info: dbTournament.sponsor_info || undefined,
    schedule_details: dbTournament.schedule_details || undefined,
    prize_information: dbTournament.prize_information || undefined,
    additional_notes: dbTournament.additional_notes || undefined,
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

      const transformedTournaments = (data as any[]).map((item: any) => transformTournament(item as DatabaseTournament));
      
      // Generate demo tournaments for cities without real tournaments
      const demoTournaments = generateDemoTournaments();
      const filteredDemoTournaments = demoTournaments.filter(demo => {
        const citySlug = demo.slug?.replace('demo-', '');
        return shouldShowDemoForCity(citySlug || '', transformedTournaments);
      });
      
      // Combine real and demo tournaments
      const allTournaments = [...transformedTournaments, ...filteredDemoTournaments];
      
      // Sort tournaments: ongoing first, then by start date ascending
      const sortedTournaments = allTournaments.sort((a, b) => {
        // Ongoing tournaments should appear first
        if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
        if (b.status === 'ongoing' && a.status !== 'ongoing') return 1;
        
        // Then sort by start date ascending
        return new Date(a.dates.start).getTime() - new Date(b.dates.start).getTime();
      });
      
      setTournaments(sortedTournaments);
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