import { Tournament } from '@/types/tournament';

// Import tournament thumbnail images
import formatImage3v3 from '@/assets/tournaments/3v3-format.webp';
import formatImage5v5 from '@/assets/tournaments/5v5-format.webp';
import formatImage7v7 from '@/assets/tournaments/7v7-format.webp';
import formatImage9v9 from '@/assets/tournaments/9v9-format.webp';
import formatImage11v11 from '@/assets/tournaments/11v11-format.webp';
import leagueTypeImage from '@/assets/tournaments/league-type.webp';
import campTypeImage from '@/assets/tournaments/camp-type.webp';
import festivalTypeImage from '@/assets/tournaments/festival-type.webp';
import tournamentTypeImage from '@/assets/tournaments/tournament-type.webp';
import cupTypeImage from '@/assets/tournaments/cup-type.webp';
import holidayTypeImage from '@/assets/tournaments/holiday-type.webp';
import showcaseTypeImage from '@/assets/tournaments/showcase-type.webp';
import defaultTournamentImage from '@/assets/tournaments/default-tournament.webp';

export interface TournamentThumbnail {
  src: string;
  alt: string;
  priority?: boolean;
}

/**
 * Get the appropriate thumbnail image for a tournament based on custom banner or type/format
 */
export const getTournamentThumbnail = (tournament: Tournament): TournamentThumbnail => {
  // First priority: custom banner uploaded by organizer
  if (tournament.banner_url) {
    return {
      src: tournament.banner_url,
      alt: `${tournament.name} - ${tournament.format} ${tournament.type} tournament in ${tournament.location.name}`,
      priority: shouldPrioritizeTournament(tournament),
    };
  }

  // Second priority: match by type for more specific categorization
  const typeImage = getImageByType(tournament.type);
  if (typeImage) {
    return {
      src: typeImage.src,
      alt: `${tournament.format} ${tournament.type} in ${tournament.location.name} - ${typeImage.description}`,
      priority: shouldPrioritizeTournament(tournament),
    };
  }

  // Third priority: fall back to format-based images
  const formatImage = getImageByFormat(tournament.format);
  if (formatImage) {
    return {
      src: formatImage.src,
      alt: `${tournament.format} tournament in ${tournament.location.name} - ${formatImage.description}`,
      priority: shouldPrioritizeTournament(tournament),
    };
  }

  // Default fallback
  return {
    src: defaultTournamentImage,
    alt: `Football tournament in ${tournament.location.name} - ${tournament.name}`,
    priority: shouldPrioritizeTournament(tournament),
  };
};

/**
 * Get tournament image based on tournament type
 */
const getImageByType = (type: string): { src: string; description: string } | null => {
  const typeMap: Record<string, { src: string; description: string }> = {
    league: {
      src: leagueTypeImage,
      description: 'competitive league championship with trophy'
    },
    camp: {
      src: campTypeImage,
      description: 'football training camp with coaching equipment'
    },
    festival: {
      src: festivalTypeImage,
      description: 'youth football festival with colorful celebration'
    },
    tournament: {
      src: tournamentTypeImage,
      description: 'competitive tournament with championship trophy'
    },
    cup: {
      src: cupTypeImage,
      description: 'prestigious cup competition with golden trophy'
    },
    holiday: {
      src: holidayTypeImage,
      description: 'holiday football program with summer activities'
    },
    showcase: {
      src: showcaseTypeImage,
      description: 'football talent showcase with scouting setup'
    },
    friendly: {
      src: tournamentTypeImage,
      description: 'friendly match competition with football atmosphere'
    },
  };

  return typeMap[type.toLowerCase()] || null;
};

/**
 * Get tournament image based on format
 */
const getImageByFormat = (format: string): { src: string; description: string } | null => {
  const formatMap: Record<string, { src: string; description: string }> = {
    '3v3': {
      src: formatImage3v3,
      description: 'small sided football pitch with mini goal posts'
    },
    '5v5': {
      src: formatImage5v5,
      description: 'small sided football pitch with goal posts'
    },
    '7v7': {
      src: formatImage7v7,
      description: 'medium sided football pitch with goal posts'
    },
    '9v9': {
      src: formatImage9v9,
      description: 'large sided football pitch with goal posts'
    },
    '11v11': {
      src: formatImage11v11,
      description: 'full sized football pitch with stadium background'
    },
  };

  return formatMap[format] || null;
};

/**
 * Check if tournament should have priority loading (e.g., featured tournaments)
 */
export const shouldPrioritizeTournament = (tournament: Tournament): boolean => {
  return (
    tournament.status === 'ongoing' ||
    tournament.status === 'today' ||
    tournament.status === 'tomorrow' ||
    tournament.status === 'registration_closes_soon'
  );
};