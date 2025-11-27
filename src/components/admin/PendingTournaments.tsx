import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TournamentCard from '@/components/TournamentCard';
import { Tournament, DatabaseTournament } from '@/types/tournament';
import { useNavigate } from 'react-router-dom';

interface PendingTournamentsProps {
  onUpdate: () => void;
}

export const PendingTournaments: React.FC<PendingTournamentsProps> = ({ onUpdate }) => {
  const [pendingTournaments, setPendingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingTournaments();
  }, []);

  const transformTournament = (dbTournament: DatabaseTournament): Tournament => {
    const now = new Date();
    const startDate = new Date(dbTournament.start_date);
    const endDate = new Date(dbTournament.end_date);
    const registrationDeadline = dbTournament.registration_deadline 
      ? new Date(dbTournament.registration_deadline) 
      : undefined;

    // Calculate status based on dates
    let status: Tournament['status'] = 'upcoming';
    
    if (now >= startDate && now <= endDate) {
      status = 'ongoing';
    } else if (startDate.toDateString() === now.toDateString()) {
      status = 'today';
    } else if (startDate.toDateString() === new Date(now.getTime() + 86400000).toDateString()) {
      status = 'tomorrow';
    } else if (now > endDate) {
      status = 'completed';
    } else if (registrationDeadline) {
      if (now > registrationDeadline) {
        status = 'registration_closed';
      } else if (registrationDeadline.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
        status = 'registration_closes_soon';
      } else {
        status = 'registration_open';
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
        country: dbTournament.country,
      },
      dates: {
        start: startDate,
        end: endDate,
        registrationDeadline,
      },
      format: dbTournament.format,
      ageGroups: dbTournament.age_groups as any[],
      teamTypes: dbTournament.team_types as any[],
      type: dbTournament.type,
      status,
      maxTeams: dbTournament.max_teams || undefined,
      registeredTeams: dbTournament.registered_teams || undefined,
      cost: dbTournament.cost_amount
        ? {
            amount: dbTournament.cost_amount,
            currency: dbTournament.cost_currency || 'GBP',
          }
        : undefined,
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
      share_cover_variant: dbTournament.share_cover_variant as any,
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

  const fetchPendingTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('is_published', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = (data || []).map(transformTournament);
      setPendingTournaments(transformed);
    } catch (error) {
      console.error('Error fetching pending tournaments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending tournaments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tournamentId: string) => {
    setProcessingIds(prev => new Set(prev).add(tournamentId));
    
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ is_published: true })
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: 'Tournament Approved',
        description: 'Tournament has been published on the site',
      });

      await fetchPendingTournaments();
      onUpdate();
    } catch (error) {
      console.error('Error approving tournament:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve tournament',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tournamentId);
        return newSet;
      });
    }
  };

  const handleReject = async (tournamentId: string) => {
    setProcessingIds(prev => new Set(prev).add(tournamentId));
    
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: 'Tournament Rejected',
        description: 'Tournament has been deleted from database',
      });

      await fetchPendingTournaments();
      onUpdate();
    } catch (error) {
      console.error('Error rejecting tournament:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject tournament',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tournamentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading tournaments...</p>
      </div>
    );
  }

  if (pendingTournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
          No Pending Tournaments
        </Badge>
        <p className="text-muted-foreground">
          All tournaments have been reviewed and published
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Pending Tournaments</h3>
          <p className="text-sm text-muted-foreground">
            {pendingTournaments.length} tournament{pendingTournaments.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingTournaments.map((tournament) => (
          <div key={tournament.id} className="relative">
            {/* Badge showing pending status */}
            <div className="absolute -top-2 -right-2 z-10">
              <Badge className="bg-orange-500 text-white font-bold shadow-lg">
                PENDING REVIEW
              </Badge>
            </div>
            
            {/* Tournament Card */}
            <TournamentCard 
              tournament={tournament} 
              onSelect={() => {}}
            />

            {/* Action Buttons Overlay */}
            <Card className="mt-4 border-orange-200">
              <CardContent className="pt-4 space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(tournament.id)}
                    disabled={processingIds.has(tournament.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(tournament.id)}
                    disabled={processingIds.has(tournament.id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/tournaments/${tournament.slug || tournament.id}`)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
