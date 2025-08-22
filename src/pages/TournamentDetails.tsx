import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTournaments } from '@/hooks/useTournaments';
import { useEngagementTracker } from '@/hooks/useEngagementTracker';
import { trackTournamentDetailView, trackRegistrationStart } from '@/hooks/useAnalyticsEvents';
import { SEO } from '@/components/SEO';
import { HelmetProvider } from 'react-helmet-async';
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
  Info,
  ChevronDown,
  Navigation,
  DollarSign,
  Camera,
  Car,
  Medal,
  Utensils,
  Coffee,
  Wifi,
  Shield
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AttachmentViewer } from '@/components/AttachmentViewer';
import { useAttachments } from '@/hooks/useAttachments';
import { ShareButton } from '@/components/ShareButton';
import { AddToCalendar } from '@/components/AddToCalendar';
import { ContactOrganizerModal } from '@/components/ContactOrganizerModal';
import { isDemoTournament } from '@/utils/demoUtils';

const TournamentDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { tournaments, loading, error } = useTournaments();
  const { trackMeaningfulAction } = useEngagementTracker();
  
  // Find tournament by slug first (preferred), then by ID for backward compatibility
  const tournament = tournaments.find(t => t.slug === slug) || tournaments.find(t => t.id === slug);
  const { attachments } = useAttachments(tournament?.id || '');
  const isDemo = tournament ? isDemoTournament(tournament) : false;

  // Track meaningful action when tournament details are viewed
  React.useEffect(() => {
    if (tournament) {
      trackMeaningfulAction('tournament-details-viewed');
      
      // Track tournament detail view for analytics
      trackTournamentDetailView(tournament.id, tournament.name);
    }
  }, [tournament, trackMeaningfulAction]);

  // Function to get appropriate icon for each feature
  const getFeatureIcon = (feature: string) => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes('trophy') || featureLower.includes('trophies')) {
      return <Trophy className="w-4 h-4 text-yellow-500/70" />;
    }
    if (featureLower.includes('photo') || featureLower.includes('camera')) {
      return <Camera className="w-4 h-4 text-purple-500/70" />;
    }
    if (featureLower.includes('parking') || featureLower.includes('car')) {
      return <Car className="w-4 h-4 text-blue-500/70" />;
    }
    if (featureLower.includes('medal') || featureLower.includes('medals')) {
      return <Medal className="w-4 h-4 text-amber-500/70" />;
    }
    if (featureLower.includes('refresh') || featureLower.includes('food') || featureLower.includes('lunch')) {
      return <Utensils className="w-4 h-4 text-green-500/70" />;
    }
    if (featureLower.includes('coffee') || featureLower.includes('drink')) {
      return <Coffee className="w-4 h-4 text-orange-500/70" />;
    }
    if (featureLower.includes('wifi') || featureLower.includes('internet')) {
      return <Wifi className="w-4 h-4 text-cyan-500/70" />;
    }
    if (featureLower.includes('security') || featureLower.includes('safe')) {
      return <Shield className="w-4 h-4 text-red-500/70" />;
    }
    if (featureLower.includes('pitch') || featureLower.includes('professional')) {
      return <MapIcon className="w-4 h-4 text-teal-500/70" />;
    }
    if (featureLower.includes('coach') || featureLower.includes('equipment')) {
      return <Users className="w-4 h-4 text-indigo-500/70" />;
    }
    // Default icon for unmatched features
    return <Star className="w-4 h-4 text-gray-500/70" />;
  };

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
    <HelmetProvider>
      <SEO
        title={`${tournament.name} | Football Tournaments UK`}
        description={`${tournament.format} tournament in ${tournament.location.name} from ${formatDate(tournament.dates.start)} to ${formatDate(tournament.dates.end)}. ${tournament.description || ''}`}
        canonicalUrl={`/tournaments/${tournament.slug || tournament.id}`}
        tournaments={[tournament]}
      />
      <div className="min-h-screen bg-background">
      {/* Hero Section with Banner */}
      <div className="relative w-full aspect-video bg-gradient-to-r from-primary to-primary-glow overflow-hidden">
        {tournament.banner_url && (
          <img 
            src={tournament.banner_url} 
            alt={tournament.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Action Buttons */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <AddToCalendar
                tournament={tournament}
                size="sm"
                variant="outline"
                className="w-full"
              />
              <ShareButton
                url={`https://footballtournamentsuk.co.uk/tournaments/${tournament.slug || tournament.id}`}
                title={tournament.name}
                description={`${tournament.format} tournament in ${tournament.location.name} from ${formatDate(tournament.dates.start)} to ${formatDate(tournament.dates.end)}`}
                size="sm"
                variant="outline"
              />
            </div>
          </div>
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
            {isDemo && (
              <Badge className="bg-orange-500 text-white font-bold animate-pulse">
                DEMO
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-6">
            {tournament.name}
            {isDemo && (
              <div className="text-sm text-orange-600 font-normal mt-2">
                This is a demo listing for illustration purposes
              </div>
            )}
          </h1>
          
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

            {/* Extended Description */}
            {tournament.extended_description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Detailed Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">
                      {tournament.extended_description}
                    </p>
                  </div>
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
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="relative">
                      <Star className="w-5 h-5 text-yellow-500 animate-pulse" fill="currentColor" />
                      <div className="absolute inset-0 w-5 h-5 text-yellow-400 animate-ping opacity-25">
                        <Star className="w-full h-full" fill="currentColor" />
                      </div>
                    </div>
                    <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent font-semibold">
                      Features & Amenities
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tournament.features.map((feature, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-gradient-to-br from-background/50 to-muted/30 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 hover:shadow-sm hover:scale-[1.02] cursor-default"
                        role="listitem"
                        aria-label={`Feature: ${feature}`}
                      >
                        <div className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                          {getFeatureIcon(feature)}
                        </div>
                        <span className="text-sm font-medium text-foreground/90 flex-1 min-w-0 truncate">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Venue Details */}
            {tournament.venue_details && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Venue Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.venue_details}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Rules and Regulations */}
            {tournament.rules_and_regulations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Rules & Regulations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.rules_and_regulations}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Schedule Details */}
            {tournament.schedule_details && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Schedule & Match Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.schedule_details}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* What to Bring */}
            {tournament.what_to_bring && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                    What to Bring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.what_to_bring}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Accommodation & Travel */}
            {tournament.accommodation_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-indigo-600" />
                    Accommodation & Travel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.accommodation_info}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Prize Information */}
            {tournament.prize_information && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    Prizes & Awards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.prize_information}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Sponsors */}
            {tournament.sponsor_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-pink-600" />
                    Sponsors & Partners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.sponsor_info}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            {tournament.additional_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-teal-600" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tournament.additional_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            <AttachmentViewer attachments={attachments} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full" size="sm">
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
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
                  <div className="text-sm text-muted-foreground">Tournament Organizer</div>
                </div>
                
                {!isDemo ? (
                  <ContactOrganizerModal tournament={tournament}>
                    <Button className="w-full" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Organizer
                    </Button>
                  </ContactOrganizerModal>
                ) : (
                  <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Demo Event - No Registration
                  </Button>
                )}
                
                {tournament.website && !isDemo && (
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
                    <DollarSign className="w-5 h-5 text-green-600" />
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

        {/* Back to Home Button */}
        <div className="text-center py-8 border-t">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
    </HelmetProvider>
  );
};

export default TournamentDetails;