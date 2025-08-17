export interface TournamentTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: {
    start: string;
    end: string;
  };
  badgeColor: string;
  textColor: string;
  iconColor: string;
  fontFamily: string;
  pattern?: {
    color: string;
    opacity: number;
  };
}

export const tournamentThemes: Record<string, TournamentTheme> = {
  league: {
    name: 'League',
    primaryColor: '#16a34a',
    secondaryColor: '#22c55e',
    accentColor: '#dcfce7',
    backgroundGradient: {
      start: '#16a34a',
      end: '#22c55e'
    },
    badgeColor: '#16a34a',
    textColor: '#111827',
    iconColor: '#16a34a',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.1)',
      opacity: 0.5
    }
  },
  
  tournament: {
    name: 'Tournament',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    accentColor: '#fef2f2',
    backgroundGradient: {
      start: '#dc2626',
      end: '#ef4444'
    },
    badgeColor: '#dc2626',
    textColor: '#111827',
    iconColor: '#dc2626',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.12)',
      opacity: 0.6
    }
  },
  
  cup: {
    name: 'Cup',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    accentColor: '#f3e8ff',
    backgroundGradient: {
      start: '#7c3aed',
      end: '#8b5cf6'
    },
    badgeColor: '#7c3aed',
    textColor: '#111827',
    iconColor: '#7c3aed',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.15)',
      opacity: 0.7
    }
  },
  
  festival: {
    name: 'Festival',
    primaryColor: '#ea580c',
    secondaryColor: '#f97316',
    accentColor: '#fff7ed',
    backgroundGradient: {
      start: '#ea580c',
      end: '#f97316'
    },
    badgeColor: '#ea580c',
    textColor: '#111827',
    iconColor: '#ea580c',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.1)',
      opacity: 0.5
    }
  },
  
  showcase: {
    name: 'Showcase',
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4',
    accentColor: '#ecfeff',
    backgroundGradient: {
      start: '#0891b2',
      end: '#06b6d4'
    },
    badgeColor: '#0891b2',
    textColor: '#111827',
    iconColor: '#0891b2',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.12)',
      opacity: 0.6
    }
  },
  
  camp: {
    name: 'Camp',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    accentColor: '#ecfdf5',
    backgroundGradient: {
      start: '#059669',
      end: '#10b981'
    },
    badgeColor: '#059669',
    textColor: '#111827',
    iconColor: '#059669',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.1)',
      opacity: 0.5
    }
  },
  
  holiday: {
    name: 'Holiday',
    primaryColor: '#d97706',
    secondaryColor: '#f59e0b',
    accentColor: '#fffbeb',
    backgroundGradient: {
      start: '#d97706',
      end: '#f59e0b'
    },
    badgeColor: '#d97706',
    textColor: '#111827',
    iconColor: '#d97706',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.1)',
      opacity: 0.5
    }
  },
  
  // Default fallback theme
  default: {
    name: 'Tournament',
    primaryColor: '#6b7280',
    secondaryColor: '#9ca3af',
    accentColor: '#f9fafb',
    backgroundGradient: {
      start: '#6b7280',
      end: '#9ca3af'
    },
    badgeColor: '#6b7280',
    textColor: '#111827',
    iconColor: '#6b7280',
    fontFamily: 'Inter',
    pattern: {
      color: 'rgba(255,255,255,0.1)',
      opacity: 0.5
    }
  }
};

export const getThemeForType = (type: string): TournamentTheme => {
  const normalizedType = type.toLowerCase();
  return tournamentThemes[normalizedType] || tournamentThemes.default;
};

export const getGoogleFontsUrl = (): string => {
  const fonts = [
    'Inter:wght@400;500;600;700',
    'Roboto:wght@400;500;700',
    'Poppins:wght@400;500;600;700'
  ];
  
  return `https://fonts.googleapis.com/css2?${fonts.map(font => `family=${font}`).join('&')}&display=swap`;
};