import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CalendarPlus, Download, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tournament } from '@/types/tournament';
import { format, addWeeks, addDays, addHours } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

interface AddToCalendarProps {
  tournament: Tournament;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const AddToCalendar: React.FC<AddToCalendarProps> = ({
  tournament,
  size = 'sm',
  variant = 'default',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  // Format datetime for different calendar systems
  const formatForGoogle = (date: Date): string => {
    return formatInTimeZone(date, 'Europe/London', "yyyyMMdd'T'HHmmss");
  };

  const formatForICS = (date: Date): string => {
    return formatInTimeZone(date, 'Europe/London', "yyyyMMdd'T'HHmmss");
  };

  // Generate tournament description
  const generateDescription = () => {
    const parts = [];
    
    if (tournament.description) {
      parts.push(tournament.description);
    }
    
    parts.push(`Format: ${tournament.format}`);
    parts.push(`Age Groups: ${tournament.ageGroups.join(', ')}`);
    parts.push(`Team Types: ${tournament.teamTypes.join(', ')}`);
    
    if (tournament.cost) {
      parts.push(`Cost: £${tournament.cost.amount} per team`);
    }
    
    if (tournament.contact.email) {
      parts.push(`Contact: ${tournament.contact.email}`);
    }
    
    if (tournament.contact.phone) {
      parts.push(`Phone: ${tournament.contact.phone}`);
    }
    
    parts.push(`Details: https://footballtournamentsuk.co.uk/tournaments/${tournament.id}`);
    
    return parts.join('\\n\\n');
  };

  // Generate location string with coordinates
  const generateLocation = () => {
    const address = `${tournament.location.name}, ${tournament.location.postcode}, ${tournament.location.region}`;
    const coords = `(${tournament.location.coordinates[1]}, ${tournament.location.coordinates[0]})`;
    return `${address} ${coords}`;
  };

  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = (isRegistration = false) => {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    
    const eventDate = isRegistration ? tournament.dates.registrationDeadline! : tournament.dates.start;
    const endDate = isRegistration ? addHours(tournament.dates.registrationDeadline!, 1) : tournament.dates.end;
    
    const title = isRegistration 
      ? `Registration Deadline - ${tournament.name}`
      : tournament.name;
    
    const description = isRegistration
      ? `Registration deadline for ${tournament.name}\\n\\nDon't forget to register!\\n\\nDetails: https://footballtournamentsuk.co.uk/tournaments/${tournament.id}`
      : generateDescription();

    const params = new URLSearchParams({
      text: title,
      dates: `${formatForGoogle(eventDate)}/${formatForGoogle(endDate)}`,
      ctz: 'Europe/London',
      location: generateLocation(),
      details: description,
      ...(tournament.contact.email && { add: tournament.contact.email }),
      // Add reminders (Google Calendar format)
      reminders: isRegistration ? '1440,120' : '10080,1440,120' // 1 week, 1 day, 2 hours in minutes
    });

    return `${baseUrl}&${params.toString()}`;
  };

  // Generate ICS file content
  const generateICSContent = (isRegistration = false) => {
    const eventDate = isRegistration ? tournament.dates.registrationDeadline! : tournament.dates.start;
    const endDate = isRegistration ? addHours(tournament.dates.registrationDeadline!, 1) : tournament.dates.end;
    
    const title = isRegistration 
      ? `Registration Deadline - ${tournament.name}`
      : tournament.name;
    
    const description = isRegistration
      ? `Registration deadline for ${tournament.name}\\n\\nDon't forget to register!\\n\\nDetails: https://footballtournamentsuk.co.uk/tournaments/${tournament.id}`
      : generateDescription();

    const uid = `${tournament.id}-${isRegistration ? 'reg' : 'event'}@footballtournamentsuk.co.uk`;
    const now = formatInTimeZone(new Date(), 'UTC', "yyyyMMdd'T'HHmmss'Z'");

    // Generate reminders/alarms
    const alarms = isRegistration 
      ? [
          'BEGIN:VALARM',
          'TRIGGER:-P1D',
          'ACTION:DISPLAY',
          'DESCRIPTION:Registration deadline tomorrow',
          'END:VALARM',
          'BEGIN:VALARM',
          'TRIGGER:-PT2H',
          'ACTION:DISPLAY',
          'DESCRIPTION:Registration deadline in 2 hours',
          'END:VALARM'
        ]
      : [
          'BEGIN:VALARM',
          'TRIGGER:-P1W',
          'ACTION:EMAIL',
          'DESCRIPTION:Tournament in 1 week',
          'SUMMARY:Tournament Reminder',
          'END:VALARM',
          'BEGIN:VALARM',
          'TRIGGER:-P1D',
          'ACTION:DISPLAY',
          'DESCRIPTION:Tournament tomorrow',
          'END:VALARM',
          'BEGIN:VALARM',
          'TRIGGER:-PT2H',
          'ACTION:DISPLAY',
          'DESCRIPTION:Tournament in 2 hours',
          'END:VALARM'
        ];

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Football Tournaments UK//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:Europe/London',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0000',
      'TZOFFSETTO:+0100',
      'TZNAME:BST',
      'DTSTART:19700329T010000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0000',
      'TZNAME:GMT',
      'DTSTART:19701025T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Europe/London:${formatForICS(eventDate)}`,
      `DTEND;TZID=Europe/London:${formatForICS(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${generateLocation()}`,
      ...(tournament.contact.email ? [`ORGANIZER:MAILTO:${tournament.contact.email}`] : []),
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      ...alarms,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  };

  // Download ICS file
  const downloadICS = (isRegistration = false) => {
    const icsContent = generateICSContent(isRegistration);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const filename = isRegistration 
      ? `${tournament.name}-registration-deadline.ics`
      : `${tournament.name}-tournament.ics`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/[^a-z0-9.-]/gi, '_');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Calendar event downloaded",
      description: `${isRegistration ? 'Registration deadline' : 'Tournament'} added to your calendar app.`,
    });
  };

  const calendarOptions = [
    {
      name: 'Google Calendar',
      icon: '📅',
      bgColor: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      action: (isReg = false) => window.open(generateGoogleCalendarUrl(isReg), '_blank', 'noopener,noreferrer')
    },
    {
      name: 'Apple Calendar',
      icon: '🍎',
      bgColor: 'bg-gray-800 hover:bg-gray-900',
      textColor: 'text-white',
      action: (isReg = false) => downloadICS(isReg)
    },
    {
      name: 'Outlook',
      icon: '📨',
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      action: (isReg = false) => downloadICS(isReg)
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
          aria-label={`Add ${tournament.name} to calendar`}
        >
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-md w-full mx-0 mb-0 rounded-t-xl rounded-b-none fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-hidden translate-y-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom animate-in"
        onPointerDownOutside={() => setIsOpen(false)}
        ref={modalRef}
      >
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Add to Calendar</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 rounded-full"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Tournament Info */}
          <div className="py-4 border-b">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{tournament.name}</h3>
            <p className="text-xs text-muted-foreground">
              {format(tournament.dates.start, 'PPP')} - {format(tournament.dates.end, 'PPP')}
            </p>
          </div>
          
          {/* Main Tournament Event */}
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <CalendarPlus className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Tournament Event</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {calendarOptions.map((option) => (
                <Button
                  key={option.name}
                  variant="outline"
                  className={`${option.bgColor} ${option.textColor} border-0 justify-start gap-3 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={() => {
                    option.action(false);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-lg">{option.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">{option.name}</div>
                    <div className="text-xs opacity-80">Tournament dates</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Registration Deadline (if exists) */}
          {tournament.dates.registrationDeadline && (
            <div className="py-4 border-t space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Registration Deadline</span>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg mb-3">
                <p className="text-xs text-orange-800 dark:text-orange-200">
                  Deadline: {format(tournament.dates.registrationDeadline, 'PPPp')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {calendarOptions.map((option) => (
                  <Button
                    key={`reg-${option.name}`}
                    variant="outline"
                    className="border-orange-200 hover:bg-orange-50 justify-start gap-3 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      option.action(true);
                      setIsOpen(false);
                    }}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-200">{option.name}</div>
                      <div className="text-xs text-orange-600 dark:text-orange-300">Registration reminder</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};