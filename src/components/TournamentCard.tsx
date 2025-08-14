import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tournament } from '@/types/tournament';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Trophy, 
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Star,
  User
} from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onSelect }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-success text-success-foreground';
      case 'ongoing':
        return 'bg-warning text-warning-foreground';
      case 'completed':
        return 'bg-neutral text-neutral-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: Tournament['type']) => {
    switch (type) {
      case 'league':
        return 'bg-primary text-primary-foreground';
      case 'tournament':
        return 'bg-secondary text-secondary-foreground';
      case 'camp':
        return 'bg-accent text-accent-foreground';
      case 'holiday':
        return 'bg-football-green text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const availableSpots = tournament.maxTeams && tournament.registeredTeams 
    ? tournament.maxTeams - tournament.registeredTeams 
    : null;

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
              {tournament.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(tournament.status)} variant="secondary">
                {tournament.status}
              </Badge>
              <Badge className={getTypeColor(tournament.type)} variant="secondary">
                {tournament.type}
              </Badge>
            </div>
          </div>
          {tournament.cost && (
            <div className="text-right">
              <div className="font-bold text-lg text-primary">
                £{tournament.cost.amount}
              </div>
              <div className="text-xs text-muted-foreground">per team</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location & Date */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium">{tournament.location.name}</div>
              <div className="text-muted-foreground">
                {tournament.location.postcode} • {tournament.location.region}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">
              {formatDate(tournament.dates.start)} - {formatDate(tournament.dates.end)}
            </span>
          </div>

          {tournament.dates.registrationDeadline && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Registration: {formatDate(tournament.dates.registrationDeadline)}
              </span>
            </div>
          )}
        </div>

        {/* Tournament Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">
              {tournament.format} • {tournament.ageGroups.join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm capitalize">
              {tournament.teamTypes.join(', ')} teams
            </span>
          </div>

          {tournament.league && (
            <div className="text-sm">
              <span className="font-medium">{tournament.league.name}</span>
              <span className="text-muted-foreground"> • {tournament.league.region}</span>
            </div>
          )}
        </div>

        {/* Team Capacity */}
        {tournament.maxTeams && tournament.registeredTeams && (
          <div className="bg-surface p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Team Registration</span>
              <span className="text-sm text-muted-foreground">
                {tournament.registeredTeams}/{tournament.maxTeams}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%` 
                }}
              />
            </div>
            {availableSpots && availableSpots > 0 && (
              <div className="text-xs text-success mt-1">
                {availableSpots} spots remaining
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {tournament.features && tournament.features.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Star className="w-4 h-4 text-accent" />
              Features
            </h4>
            <div className="flex flex-wrap gap-1">
              {tournament.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {tournament.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tournament.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {tournament.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tournament.description}
          </p>
        )}

        {/* Contact Info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Organized by:</div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{tournament.contact.name}</span>
          </div>
          {tournament.contact.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{tournament.contact.email}</span>
            </div>
          )}
          {tournament.contact.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{tournament.contact.phone}</span>
            </div>
          )}
          {tournament.website && (
            <div className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              <span>Website</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onSelect(tournament)}
            className="flex-1"
            size="sm"
          >
            View on Map
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="px-3"
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;