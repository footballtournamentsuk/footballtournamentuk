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

  // Format datetime for Google Calendar (UTC format required)
  const formatForGoogle = (date: Date): string => {
    return formatInTimeZone(date, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
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

  // Generate location string for Google Calendar (cleaner format)
  const generateLocation = () => {
    return `${tournament.location.name}, ${tournament.location.postcode}, ${tournament.location.region}`;
  };

  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = (isRegistration = false) => {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    
    const eventDate = isRegistration ? tournament.dates.registrationDeadline! : tournament.dates.start;
    const endDate = isRegistration ? addHours(tournament.dates.registrationDeadline!, 1) : tournament.dates.end;
    
    const title = isRegistration 
      ? `Registration Deadline - ${tournament.name}`
      : tournament.name;
    
    // Create cleaner description for Google Calendar
    const createGoogleDescription = () => {
      const parts = [];
      
      if (tournament.description && !isRegistration) {
        parts.push(tournament.description);
        parts.push(''); // Empty line
      }
      
      if (!isRegistration) {
        parts.push(`🏆 ${tournament.format}`);
        parts.push(`👥 Age Groups: ${tournament.ageGroups.join(', ')}`);
        parts.push(`⚽ Team Types: ${tournament.teamTypes.join(', ')}`);
        
        if (tournament.cost) {
          parts.push(`💰 Cost: £${tournament.cost.amount} per team`);
        }
        
        if (tournament.contact.email) {
          parts.push(`📧 Contact: ${tournament.contact.email}`);
        }
        
        if (tournament.contact.phone) {
          parts.push(`📞 Phone: ${tournament.contact.phone}`);
        }
        
        parts.push(''); // Empty line
        parts.push(`🔗 Details: https://footballtournamentsuk.co.uk/tournaments/${tournament.id}`);
      } else {
        parts.push(`Registration deadline for ${tournament.name}`);
        parts.push('');
        parts.push("⚠️ Don't forget to register!");
        parts.push('');
        parts.push(`🔗 Register: https://footballtournamentsuk.co.uk/tournaments/${tournament.id}`);
      }
      
      return parts.join('\n');
    };

    // Google Calendar URL parameters
    const params = new URLSearchParams();
    params.append('action', 'TEMPLATE');
    params.append('text', title);
    params.append('dates', `${formatForGoogle(eventDate)}/${formatForGoogle(endDate)}`);
    params.append('location', generateLocation());
    params.append('details', createGoogleDescription());
    
    // Add organizer email if available
    if (tournament.contact.email) {
      params.append('add', tournament.contact.email);
    }

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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

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
      
      {/* Mobile-first bottom sheet with responsive centering */}
      <DialogContent 
        className="p-0 gap-0 border-0 bg-transparent shadow-none max-w-none w-full h-full flex items-end justify-center 
                   sm:items-center sm:justify-center sm:h-auto fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out 
                   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-full 
                   data-[state=open]:slide-in-from-bottom-full sm:data-[state=closed]:slide-out-to-bottom-0 
                   sm:data-[state=open]:slide-in-from-bottom-0"
        onPointerDownOutside={() => setIsOpen(false)}
        onInteractOutside={() => setIsOpen(false)}
        aria-modal="true"
        role="dialog"
        ref={modalRef}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1]" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        
        {/* Modal content */}
        <div className="relative bg-background border border-border rounded-t-[20px] sm:rounded-[20px] shadow-lg w-full 
                        max-w-[480px] max-h-[80vh] sm:max-h-[90vh] mx-4 sm:mx-auto mb-0 sm:mb-auto overflow-hidden
                        animate-in slide-in-from-bottom-4 duration-200 ease-out
                        [padding:16px_16px_max(16px,env(safe-area-inset-bottom))_16px]
                        [width:calc(100vw-32px)]">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Add to Calendar</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 rounded-full hover:bg-muted"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Scrollable content */}
          <div className="max-h-[calc(80vh-120px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto overscroll-contain">
            {/* Tournament Info */}
            <div className="py-4 border-b border-border">
              <h3 className="font-semibold text-base mb-2 line-clamp-2 text-foreground">{tournament.name}</h3>
              <p className="text-sm text-muted-foreground">
                {format(tournament.dates.start, 'PPP')} - {format(tournament.dates.end, 'PPP')}
              </p>
            </div>
            
            {/* Main Tournament Event */}
            <div className="py-6 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base text-foreground">Tournament Event</span>
              </div>
              
              <div className="space-y-3">
                {calendarOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="outline"
                    className="w-full h-12 justify-start gap-4 rounded-xl border-2 hover:border-primary
                               hover:bg-primary/5 active:scale-[0.98] transition-all duration-200
                               focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
                    onClick={() => {
                      option.action(false);
                      setIsOpen(false);
                    }}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm text-foreground">{option.name}</div>
                      <div className="text-xs text-muted-foreground">Tournament dates</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Registration Deadline (if exists) */}
            {tournament.dates.registrationDeadline && (
              <div className="py-6 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-base text-foreground">Registration Deadline</span>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4 rounded-xl">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Deadline: {format(tournament.dates.registrationDeadline, 'PPPp')}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {calendarOptions.map((option) => (
                    <Button
                      key={`reg-${option.name}`}
                      variant="outline"
                      className="w-full h-12 justify-start gap-4 rounded-xl border-2 border-orange-200 
                                 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30
                                 active:scale-[0.98] transition-all duration-200
                                 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:outline-none"
                      onClick={() => {
                        option.action(true);
                        setIsOpen(false);
                      }}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm text-orange-800 dark:text-orange-200">{option.name}</div>
                        <div className="text-xs text-orange-600 dark:text-orange-300">Registration reminder</div>
                      </div>
                      <Download className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};