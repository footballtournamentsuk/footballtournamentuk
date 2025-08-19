import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TournamentKPIs {
  total: number;
  active: number;
  expired: number;
  demo: number;
  real: number;
  byCity: { city: string; count: number }[];
  byType: { type: string; count: number }[];
  byFormat: { format: string; count: number }[];
  trends7d: number;
  trends30d: number;
}

interface UserAnalytics {
  totalUsers: number;
  signUpsLast7d: number;
  signUpsLast30d: number;
  emailVerificationRate: number;
  avgTimeToVerify: number;
}

interface FunnelMetrics {
  listViews: number;
  detailViews: number;
  registrationStarts: number;
  registrationCompletions: number;
  dropOffRate: number;
}

interface GeographyData {
  topCities: { city: string; count: number; region: string }[];
  topPostcodes: { postcode: string; count: number }[];
  regionDistribution: { region: string; count: number }[];
}

interface PerformanceMetrics {
  avgApiLatency: number;
  errorRate: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

interface AnalyticsData {
  tournaments: TournamentKPIs;
  users: UserAnalytics;
  funnel: FunnelMetrics;
  geography: GeographyData;
  performance: PerformanceMetrics;
  loading: boolean;
  error: string | null;
}

export const useAnalyticsData = (dateRange: { start: Date; end: Date } = {
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  end: new Date()
}) => {
  const [data, setData] = useState<AnalyticsData>({
    tournaments: {
      total: 0,
      active: 0,
      expired: 0,
      demo: 0,
      real: 0,
      byCity: [],
      byType: [],
      byFormat: [],
      trends7d: 0,
      trends30d: 0,
    },
    users: {
      totalUsers: 0,
      signUpsLast7d: 0,
      signUpsLast30d: 0,
      emailVerificationRate: 0,
      avgTimeToVerify: 0,
    },
    funnel: {
      listViews: 0,
      detailViews: 0,
      registrationStarts: 0,
      registrationCompletions: 0,
      dropOffRate: 0,
    },
    geography: {
      topCities: [],
      topPostcodes: [],
      regionDistribution: [],
    },
    performance: {
      avgApiLatency: 0,
      errorRate: 0,
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
      },
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [
        tournamentData,
        userData,
        geographyData,
      ] = await Promise.all([
        fetchTournamentKPIs(),
        fetchUserAnalytics(),
        fetchGeographyData(),
      ]);

      setData(prev => ({
        ...prev,
        tournaments: tournamentData,
        users: userData,
        geography: geographyData,
        funnel: {
          // Mock data for now - would be tracked via analytics events
          listViews: 1250,
          detailViews: 380,
          registrationStarts: 85,
          registrationCompletions: 67,
          dropOffRate: 21.2,
        },
        performance: {
          // Mock data for now - would be from monitoring service
          avgApiLatency: 245,
          errorRate: 0.8,
          coreWebVitals: {
            lcp: 2200,
            fid: 85,
            cls: 0.08,
          },
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics data',
      }));
    }
  };

  const fetchTournamentKPIs = async (): Promise<TournamentKPIs> => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all tournaments
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        start_date,
        end_date,
        location_name,
        region,
        type,
        format,
        organizer_id,
        created_at
      `);

    if (error) throw error;

    const total = tournaments?.length || 0;
    const active = tournaments?.filter(t => {
      const start = new Date(t.start_date);
      const end = new Date(t.end_date);
      return now >= start && now <= end;
    }).length || 0;
    
    const expired = tournaments?.filter(t => {
      const end = new Date(t.end_date);
      return now > end;
    }).length || 0;

    // Count demo vs real tournaments (demo tournaments don't have organizer_id)
    const demo = tournaments?.filter(t => !t.organizer_id).length || 0;
    const real = tournaments?.filter(t => t.organizer_id).length || 0;

    // Group by city
    const cityGroups = tournaments?.reduce((acc, t) => {
      const city = t.location_name || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const byCity = Object.entries(cityGroups)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group by type
    const typeGroups = tournaments?.reduce((acc, t) => {
      const type = t.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const byType = Object.entries(typeGroups)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Group by format
    const formatGroups = tournaments?.reduce((acc, t) => {
      const format = t.format || 'Unknown';
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const byFormat = Object.entries(formatGroups)
      .map(([format, count]) => ({ format, count }))
      .sort((a, b) => b.count - a.count);

    // Trends
    const trends7d = tournaments?.filter(t => {
      const created = new Date(t.created_at);
      return created >= sevenDaysAgo;
    }).length || 0;

    const trends30d = tournaments?.filter(t => {
      const created = new Date(t.created_at);
      return created >= thirtyDaysAgo;
    }).length || 0;

    return {
      total,
      active,
      expired,
      demo,
      real,
      byCity,
      byType,
      byFormat,
      trends7d,
      trends30d,
    };
  };

  const fetchUserAnalytics = async (): Promise<UserAnalytics> => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('created_at');

    if (error) throw error;

    const totalUsers = profiles?.length || 0;
    
    const signUpsLast7d = profiles?.filter(p => {
      const created = new Date(p.created_at);
      return created >= sevenDaysAgo;
    }).length || 0;

    const signUpsLast30d = profiles?.filter(p => {
      const created = new Date(p.created_at);
      return created >= thirtyDaysAgo;
    }).length || 0;

    // Mock email verification metrics (would need auth.users access in real implementation)
    const emailVerificationRate = 94.5;
    const avgTimeToVerify = 2.3; // hours

    return {
      totalUsers,
      signUpsLast7d,
      signUpsLast30d,
      emailVerificationRate,
      avgTimeToVerify,
    };
  };

  const fetchGeographyData = async (): Promise<GeographyData> => {
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('location_name, region, postcode');

    if (error) throw error;

    // Group by city
    const cityGroups = tournaments?.reduce((acc, t) => {
      const city = t.location_name || 'Unknown';
      const region = t.region || 'Unknown';
      const key = `${city}-${region}`;
      if (!acc[key]) {
        acc[key] = { city, region, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { city: string; region: string; count: number }>) || {};

    const topCities = Object.values(cityGroups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group by postcode
    const postcodeGroups = tournaments?.reduce((acc, t) => {
      const postcode = t.postcode || 'Unknown';
      acc[postcode] = (acc[postcode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topPostcodes = Object.entries(postcodeGroups)
      .map(([postcode, count]) => ({ postcode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group by region
    const regionGroups = tournaments?.reduce((acc, t) => {
      const region = t.region || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const regionDistribution = Object.entries(regionGroups)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    return {
      topCities,
      topPostcodes,
      regionDistribution,
    };
  };

  return {
    data,
    refetch: fetchAnalyticsData,
  };
};