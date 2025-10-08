import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Tournament } from '@/types/tournament';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

interface RelatedTournamentsProps {
  currentTournament: Tournament;
  allTournaments: Tournament[];
  maxItems?: number;
}

export const RelatedTournaments: React.FC<RelatedTournamentsProps> = ({
  currentTournament,
  allTournaments,
  maxItems = 3
}) => {
  // Find related tournaments based on format, region, and age groups
  const relatedTournaments = useMemo(() => {
    const filtered = allTournaments.filter(tournament => {
      // Exclude current tournament
      if (tournament.id === currentTournament.id) return false;
      
      // Exclude completed/cancelled tournaments
      if (['completed', 'cancelled'].includes(tournament.status)) return false;
      
      // Calculate relevance score
      let score = 0;
      
      // Same format (high priority)
      if (tournament.format === currentTournament.format) score += 5;
      
      // Same region (medium priority)
      if (tournament.location.region === currentTournament.location.region) score += 3;
      
      // Overlapping age groups (medium priority)
      const hasCommonAge = tournament.ageGroups.some(age => 
        currentTournament.ageGroups.includes(age)
      );
      if (hasCommonAge) score += 3;
      
      // Same type (low priority)
      if (tournament.type === currentTournament.type) score += 2;
      
      return score >= 3; // Minimum relevance threshold
    });
    
    // Sort by relevance and return top results
    return filtered
      .sort((a, b) => {
        // Calculate score for sorting
        const getScore = (t: Tournament) => {
          let score = 0;
          if (t.format === currentTournament.format) score += 5;
          if (t.location.region === currentTournament.location.region) score += 3;
          if (t.ageGroups.some(age => currentTournament.ageGroups.includes(age))) score += 3;
          if (t.type === currentTournament.type) score += 2;
          return score;
        };
        return getScore(b) - getScore(a);
      })
      .slice(0, maxItems);
  }, [currentTournament, allTournaments, maxItems]);

  if (relatedTournaments.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Related Tournaments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedTournaments.map((tournament) => (
          <Link
            key={tournament.id}
            to={`/tournaments/${tournament.slug || tournament.id}`}
            className="block group"
          >
            <div className="p-4 rounded-lg border border-border hover:border-primary transition-colors bg-surface hover:bg-surface/80">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {tournament.name}
                </h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tournament.location.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{formatDate(tournament.dates.start)}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {tournament.format}
                  </Badge>
                  {tournament.ageGroups.slice(0, 2).map((age, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {age}
                    </Badge>
                  ))}
                  {tournament.ageGroups.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{tournament.ageGroups.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/tournaments?format=${currentTournament.format}&regions=${currentTournament.location.region}`}>
            View All Similar Tournaments
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
