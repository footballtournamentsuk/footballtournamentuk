import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CalendarPlus, Download, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tournament } from '@/types/tournament';
import { format, addWeeks, addDays, addHours } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { getCurrencySymbol } from '@/utils/currency';

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
      parts.push(`Cost: ${getCurrencySymbol(tournament.cost.currency)}${tournament.cost.amount} per team`);
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
          parts.push(`💰 Cost: ${getCurrencySymbol(tournament.cost.currency)}${tournament.cost.amount} per team`);
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
      action: (isReg = false) => {
        // Direct redirect to Google Calendar, skip modal
        window.open(generateGoogleCalendarUrl(isReg), '_blank', 'noopener,noreferrer');
        return true; // Indicates direct action, don't close modal
      }
    },
    {
      name: 'Apple Calendar',
      icon: '🍎',
      action: (isReg = false) => downloadICS(isReg)
    },
    {
      name: 'Outlook',
      icon: '📨',
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

  // Handle direct Google Calendar action
  const handleDirectGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(false), '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleDirectGoogleCalendar}
      className={`gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200 ${className}`}
      aria-label={`Add ${tournament.name} to Google Calendar`}
    >
      <Calendar className="h-4 w-4" />
      Add to Google Calendar
    </Button>
  );
};