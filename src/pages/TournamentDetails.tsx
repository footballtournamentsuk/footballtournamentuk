import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTournaments } from '@/hooks/useTournaments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  ArrowLeft,
  GraduationCap,
  MapIcon,
  Building,
  Briefcase,
  Award,
  FileText,
  Home,
  Gift,
  Calendar as CalendarIcon,
  Info
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const TournamentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, loading, error } = useTournaments();

  const tournament = tournaments.find(t => t.id === id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading tournament details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">Error loading tournament: {error}</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <p className="text-muted-foreground mb-4">The tournament you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatDateLong = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
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

  const getTypeColor = (type: string) => {
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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Banner */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-primary-glow overflow-hidden">
        {tournament.banner_url && (
          <img 
            src={tournament.banner_url} 
            alt={tournament.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-between py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="self-start text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>
        </div>
      </div>

      {/* Tournament Info Section */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getStatusColor(tournament.status)} variant="secondary">
              {tournament.status.replace(/_/g, ' ')}
            </Badge>
            <Badge className={getTypeColor(tournament.type)} variant="secondary">
              {tournament.type}
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">{tournament.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Location</div>
                <div className="text-muted-foreground">{tournament.location.name}</div>
                <div className="text-sm text-muted-foreground">
                  {tournament.location.postcode} • {tournament.location.region}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Tournament Dates</div>
                <div className="text-muted-foreground">
                  {formatDate(tournament.dates.start)} - {formatDate(tournament.dates.end)}
                </div>
              </div>
            </div>
            
            {tournament.dates.registrationDeadline && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="font-medium">Registration Deadline</div>
                  <div className="text-muted-foreground">
                    {formatDate(tournament.dates.registrationDeadline)}
                  </div>
                </div>
              </div>
            )}
            
            {tournament.cost && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="font-medium">Cost per Team</div>
                  <div className="text-2xl font-bold text-primary">
                    £{tournament.cost.amount}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {tournament.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    About This Tournament
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{tournament.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Tournament Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Tournament Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Format</div>
                      <div className="text-muted-foreground">{tournament.format}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Age Groups</div>
                      <div className="text-muted-foreground">{tournament.ageGroups.join(', ')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Team Types</div>
                      <div className="text-muted-foreground capitalize">{tournament.teamTypes.join(', ')} teams</div>
                    </div>
                  </div>

                  {tournament.league && (
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">League</div>
                        <div className="text-muted-foreground">{tournament.league.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Registration Progress */}
                {tournament.maxTeams && tournament.registeredTeams && (
                  <div className="bg-surface p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Team Registration</span>
                      <span className="text-muted-foreground">
                        {tournament.registeredTeams}/{tournament.maxTeams}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%` 
                        }}
                      />
                    </div>
                    {availableSpots && availableSpots > 0 && (
                      <div className="text-sm text-success mt-2">
                        {availableSpots} spots remaining
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            {tournament.features && tournament.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Features & Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tournament.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="justify-center py-2">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium text-sm">Tournament Dates</div>
                  <div className="text-muted-foreground">
                    {formatDateLong(tournament.dates.start)} - {formatDateLong(tournament.dates.end)}
                  </div>
                </div>
                
                {tournament.dates.registrationDeadline && (
                  <div>
                    <div className="font-medium text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4 text-warning" />
                      Registration Deadline
                    </div>
                    <div className="text-muted-foreground">
                      {formatDateLong(tournament.dates.registrationDeadline)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{tournament.location.name}</div>
                  <div className="text-muted-foreground">
                    {tournament.location.postcode} • {tournament.location.region}
                  </div>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              </CardContent>
            </Card>

            {/* Organizer Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Organizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{tournament.contact.name}</div>
                </div>
                
                {tournament.contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${tournament.contact.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {tournament.contact.email}
                    </a>
                  </div>
                )}
                
                {tournament.contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`tel:${tournament.contact.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {tournament.contact.phone}
                    </a>
                  </div>
                )}
                
                {tournament.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={tournament.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Tournament Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Information */}
            {tournament.cost && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Registration Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      £{tournament.cost.amount}
                    </div>
                    <div className="text-muted-foreground">per team</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Currency: {tournament.cost.currency}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;