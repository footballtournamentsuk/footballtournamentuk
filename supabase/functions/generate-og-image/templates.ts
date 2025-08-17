import { TournamentTheme, getGoogleFontsUrl } from './themes.ts';

export interface TournamentData {
  id: string;
  name: string;
  type: string;
  location_name: string;
  start_date: string;
  end_date: string;
}

export interface TemplateData {
  tournament: TournamentData;
  theme: TournamentTheme;
  dateRange: string;
  formattedStartDate: string;
}

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateStr));
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return start === end ? start : `${start} - ${end}`;
};

export const generateSVGTemplate = (data: TemplateData): string => {
  const { tournament, theme, dateRange, formattedStartDate } = data;
  
  // Truncate tournament name if too long
  const displayName = tournament.name.length > 35 ? 
    tournament.name.substring(0, 32) + '...' : 
    tournament.name;
  
  // Truncate location if too long
  const displayLocation = tournament.location_name.length > 25 ? 
    tournament.location_name.substring(0, 22) + '...' : 
    tournament.location_name;

  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.backgroundGradient.start}"/>
          <stop offset="100%" style="stop-color:${theme.backgroundGradient.end}"/>
        </linearGradient>
        
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primaryColor}"/>
          <stop offset="100%" style="stop-color:${theme.secondaryColor}"/>
        </linearGradient>
        
        <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primaryColor}"/>
          <stop offset="100%" style="stop-color:${theme.secondaryColor}"/>
        </linearGradient>
        
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
        
        <style>
          @import url('${getGoogleFontsUrl()}');
          .title { font-family: '${theme.fontFamily}', system-ui, -apple-system, sans-serif; }
          .text { font-family: '${theme.fontFamily}', system-ui, -apple-system, sans-serif; }
          .brand { font-family: '${theme.fontFamily}', system-ui, -apple-system, sans-serif; }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      
      <!-- Background Pattern -->
      ${theme.pattern ? `
        <circle cx="300" cy="150" r="40" fill="${theme.pattern.color}" opacity="${theme.pattern.opacity}"/>
        <circle cx="900" cy="500" r="60" fill="${theme.pattern.color}" opacity="${theme.pattern.opacity * 0.8}"/>
        <circle cx="150" cy="400" r="25" fill="${theme.pattern.color}" opacity="${theme.pattern.opacity * 0.6}"/>
        <circle cx="1050" cy="200" r="35" fill="${theme.pattern.color}" opacity="${theme.pattern.opacity * 0.7}"/>
      ` : ''}
      
      <!-- Main Container -->
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="white" filter="url(#shadow)"/>
      
      <!-- Header Section -->
      <!-- Logo Area -->
      <rect x="100" y="100" width="48" height="48" rx="12" fill="url(#logoGradient)"/>
      <text x="124" y="130" class="text" font-size="24" font-weight="700" fill="white" text-anchor="middle">⚽</text>
      <text x="170" y="130" class="brand" font-size="20" font-weight="600" fill="#374151">Football Tournaments UK</text>
      
      <!-- Type Badge -->
      <rect x="950" y="100" width="120" height="36" rx="18" fill="${theme.badgeColor}"/>
      <text x="1010" y="122" class="text" font-size="14" font-weight="500" fill="white" text-anchor="middle" text-transform="capitalize">${theme.name}</text>
      
      <!-- Main Content -->
      <!-- Tournament Name -->
      <text x="100" y="220" class="title" font-size="${displayName.length > 25 ? '38' : '42'}" font-weight="700" fill="${theme.textColor}">
        ${displayName}
      </text>
      
      <!-- Details Section -->
      <!-- Location Icon and Text -->
      <circle cx="118" cy="320" r="12" fill="${theme.iconColor}"/>
      <path d="M118 312 L118 328 M110 320 L126 320" stroke="white" stroke-width="2"/>
      <text x="150" y="326" class="text" font-size="18" font-weight="500" fill="#4b5563">${displayLocation}</text>
      
      <!-- Date Icon and Text -->
      <rect x="400" y="308" width="24" height="24" rx="4" fill="${theme.iconColor}"/>
      <text x="412" y="324" class="text" font-size="12" font-weight="600" fill="white" text-anchor="middle">${formattedStartDate}</text>
      <text x="440" y="326" class="text" font-size="18" font-weight="500" fill="#4b5563">${dateRange}</text>
      
      <!-- Decorative Elements -->
      <rect x="700" y="315" width="80" height="2" rx="1" fill="${theme.accentColor}" opacity="0.6"/>
      <rect x="800" y="315" width="40" height="2" rx="1" fill="${theme.secondaryColor}" opacity="0.8"/>
      
      <!-- Footer Section -->
      <!-- Footer Line -->
      <line x1="100" y1="480" x2="1100" y2="480" stroke="#f3f4f6" stroke-width="2"/>
      
      <!-- Website -->
      <text x="100" y="520" class="text" font-size="16" font-weight="500" fill="#6b7280">footballtournamentsuk.co.uk</text>
      
      <!-- CTA Button -->
      <rect x="880" y="500" width="220" height="40" rx="12" fill="url(#ctaGradient)"/>
      <text x="990" y="524" class="text" font-size="16" font-weight="600" fill="white" text-anchor="middle">View Tournament Details</text>
      
      <!-- Subtle Branding Elements -->
      <circle cx="1080" cy="450" r="3" fill="${theme.secondaryColor}" opacity="0.4"/>
      <circle cx="1100" cy="430" r="2" fill="${theme.primaryColor}" opacity="0.6"/>
      <circle cx="1060" cy="470" r="2" fill="${theme.accentColor}" opacity="0.8"/>
    </svg>
  `;
};

export const generateFallbackSVG = (): string => {
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#16a34a"/>
      <text x="600" y="315" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">Football Tournaments UK</text>
    </svg>
  `;
};