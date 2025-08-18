import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  User,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { ShareButton } from './ShareButton';
import { AddToCalendar } from './AddToCalendar';
import { ContactOrganizerModal } from './ContactOrganizerModal';
import { getTournamentThumbnail, shouldPrioritizeTournament } from '@/utils/tournamentThumbnails';
import { TournamentImage } from '@/components/ui/tournament-image';

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
        return 'bg-neutral text-neutral-foreground';
      case 'ongoing':
        return 'bg-destructive text-destructive-foreground';
      case 'today':
        return 'bg-warning text-warning-foreground';
      case 'tomorrow':
        return 'bg-accent text-accent-foreground';
      case 'registration_open':
        return 'bg-success text-success-foreground';
      case 'registration_closes_soon':
        return 'bg-warning text-warning-foreground';
      case 'registration_closed':
        return 'bg-neutral text-neutral-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
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

  const thumbnail = getTournamentThumbnail(tournament);

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
      {/* Tournament Thumbnail */}
      <div className="relative w-full h-48">
        <TournamentImage
          src={thumbnail.src}
          alt={thumbnail.alt}
          priority={thumbnail.priority}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          width={640}
          height={512}
          style={{
            aspectRatio: '640/512',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <CardHeader className="pb-3">
        {/* Header row with badges and price */}
        <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[32px]">
          {/* Status and Type Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(tournament.status)} variant="secondary">
              {tournament.status.replace(/_/g, ' ')}
            </Badge>
            <Badge className={getTypeColor(tournament.type)} variant="secondary">
              {tournament.type}
            </Badge>
          </div>
          
          {/* Price pill - aligned to right on desktop, wraps on mobile */}
          {tournament.cost && (
            <div className="ml-auto bg-surface border rounded-lg px-3 py-1.5 text-center">
              <div className="font-semibold text-primary">
                £{tournament.cost.amount}
              </div>
              <div className="text-xs text-muted-foreground">per team</div>
            </div>
          )}
        </div>
        
        {/* Tournament Title - Most prominent */}
        <div className="mb-4">
          <h3 className="font-semibold text-xl leading-tight group-hover:text-primary transition-colors">
            {tournament.name}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location & Date */}
        <div className="space-y-3">
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

        {/* Participant Details */}
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

        {/* Organizer Info */}
        <div className="space-y-1 text-xs text-muted-foreground border-t pt-3 mt-3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">Organized by:</div>
            {(() => {
              const completedFields = [
                tournament.banner_url,
                tournament.extended_description,
                tournament.venue_details,
                tournament.rules_and_regulations,
                tournament.schedule_details,
                tournament.what_to_bring,
                tournament.accommodation_info,
                tournament.prize_information,
                tournament.sponsor_info,
                tournament.additional_notes
              ].filter(field => field && (typeof field === 'string' ? field.trim().length > 0 : true));
              const totalFields = 10;
              const percentage = Math.round((completedFields.length / totalFields) * 100);
              
              const getVariant = () => {
                if (percentage >= 80) return 'default';
                if (percentage >= 50) return 'secondary';
                return 'outline';
              };
              
              return (
                <Badge variant={getVariant()} className="text-xs">
                  {percentage}% Complete
                </Badge>
              );
            })()}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{tournament.contact.name}</span>
          </div>
          {tournament.contact.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="truncate">{tournament.contact.email}</span>
            </div>
          )}
          {tournament.contact.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{tournament.contact.phone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {/* Primary Action - View Details */}
          <Button 
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-600/40 text-white border-0 rounded-xl transition-all duration-300 font-semibold shadow-lg"
            size="sm"
            asChild
          >
            <Link to={`/tournaments/${tournament.slug || tournament.id}`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>

          {/* Secondary Action - Contact Organizer */}
          <ContactOrganizerModal tournament={tournament}>
            <Button 
              className="w-full bg-green-500/80 backdrop-blur-sm hover:bg-green-600/90 hover:shadow-lg hover:shadow-green-500/30 text-white border border-green-400/30 rounded-xl transition-all duration-300 font-medium" 
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Organizer
            </Button>
          </ContactOrganizerModal>

          {/* Tertiary Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="w-full bg-green-100/60 backdrop-blur-sm hover:bg-green-200/70 hover:shadow-lg hover:shadow-green-500/20 text-green-800 border border-green-200/30 rounded-xl transition-all duration-300" 
                size="sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                View Location
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-popover border border-border shadow-lg z-50">
              <DropdownMenuItem asChild>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(tournament.location.name + ', ' + tournament.location.postcode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Waze
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tournament.location.coordinates[1] + ',' + tournament.location.coordinates[0])}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AddToCalendar
            tournament={tournament}
            size="sm"
            variant="default"
            className="w-full bg-green-100/60 backdrop-blur-sm hover:bg-green-200/70 hover:shadow-lg hover:shadow-green-500/20 text-green-800 border border-green-200/30 rounded-xl transition-all duration-300"
          />
          
          <div className="w-full">
            <ShareButton
              url={`https://footballtournamentsuk.co.uk/tournaments/${tournament.slug || tournament.id}`}
              title={tournament.name}
              description={`${tournament.format} tournament in ${tournament.location.name} from ${formatDate(tournament.dates.start)} to ${formatDate(tournament.dates.end)}`}
              size="sm"
              variant="outline"
              className="w-full bg-green-100/60 backdrop-blur-sm hover:bg-green-200/70 hover:shadow-lg hover:shadow-green-500/20 text-green-800 border border-green-200/30 rounded-xl transition-all duration-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;