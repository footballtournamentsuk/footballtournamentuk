import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isDemoTournament } from '@/utils/demoUtils';

export interface RegionStats {
  total_active: number;
  upcoming: number;
  cities_count: number;
}

export interface RegionStatsMap {
  [regionSlug: string]: RegionStats;
}

export const useRegionStats = () => {
  const [stats, setStats] = useState<RegionStatsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRegionSlug = (region: string): string => {
    const regionMap: Record<string, string> = {
      'Greater London': 'england',
      'Greater Manchester': 'england',
      'West Midlands': 'england',
      'Merseyside': 'england',
      'West Yorkshire': 'england',
      'Tyne and Wear': 'england',
      'South Yorkshire': 'england',
      'South West England': 'england',
      'East Midlands': 'england',
      'Hampshire': 'england',
      'East Sussex': 'england',
      'Oxfordshire': 'england',
      'Cambridgeshire': 'england',
      'Scotland': 'scotland',
      'Wales': 'wales',
      'Northern Ireland': 'northern-ireland'
    };
    return regionMap[region] || 'england';
  };

  const fetchRegionStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all tournaments
      const { data: tournaments, error: fetchError } = await supabase
        .from('tournaments')
        .select('*');

      if (fetchError) {
        throw fetchError;
      }

      if (!tournaments) {
        setStats({});
        return;
      }

      // Filter out demo tournaments
      const realTournaments = tournaments.filter(tournament => 
        tournament.organizer_id !== 'demo' && !tournament.id.startsWith('demo-')
      );

      // Calculate stats by region
      const regionStats: RegionStatsMap = {};
      const now = new Date();

      realTournaments.forEach(tournament => {
        const regionSlug = getRegionSlug(tournament.region || 'England');
        
        if (!regionStats[regionSlug]) {
          regionStats[regionSlug] = {
            total_active: 0,
            upcoming: 0,
            cities_count: 0
          };
        }

        const startDate = new Date(tournament.start_date);
        const endDate = new Date(tournament.end_date);

        // Count active tournaments (ongoing or upcoming)
        if (endDate >= now) {
          regionStats[regionSlug].total_active++;
          
          // Count upcoming tournaments (not yet started)
          if (startDate > now) {
            regionStats[regionSlug].upcoming++;
          }
        }
      });

      // Calculate cities count for each region
      const citiesByRegion: Record<string, Set<string>> = {};
      realTournaments.forEach(tournament => {
        const regionSlug = getRegionSlug(tournament.region || 'England');
        
        if (!citiesByRegion[regionSlug]) {
          citiesByRegion[regionSlug] = new Set();
        }
        
        // Add city based on location_name
        if (tournament.location_name) {
          citiesByRegion[regionSlug].add(tournament.location_name);
        }
      });

      // Update cities_count in stats
      Object.keys(regionStats).forEach(regionSlug => {
        regionStats[regionSlug].cities_count = citiesByRegion[regionSlug]?.size || 0;
      });

      setStats(regionStats);
    } catch (err) {
      console.error('Error fetching region stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch region stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionStats();
  }, []);

  return { stats, loading, error, refetch: fetchRegionStats };
};