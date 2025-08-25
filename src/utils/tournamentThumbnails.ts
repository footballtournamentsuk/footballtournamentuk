import { Tournament } from '@/types/tournament';
import placeholderCard from '@/assets/placeholders/placeholder-card.webp';
import placeholderShare from '@/assets/placeholders/placeholder-share-1200x630.webp';

export interface TournamentThumbnail {
  src: string;
  alt: string;
  priority?: boolean;
}

export interface TournamentImage {
  src: string;
  alt: string;
  priority?: boolean;
}

/**
 * Get tournament image with proper fallback logic for listing cards
 * Priority: banner_url → share_cover_url → placeholder
 */
export const getTournamentThumbnail = (tournament: Tournament): TournamentThumbnail => {
  const priority = shouldPrioritizeTournament(tournament);

  // First priority: banner_url (optimized for card display)
  if (tournament.banner_url) {
    return {
      src: tournament.banner_url,
      alt: tournament.share_cover_alt || `Tournament: ${tournament.name}`,
      priority,
    };
  }

  // Second priority: share_cover_url
  if (tournament.share_cover_url) {
    return {
      src: tournament.share_cover_url,
      alt: tournament.share_cover_alt || `Tournament: ${tournament.name}`,
      priority,
    };
  }

  // Fallback: branded placeholder
  return {
    src: placeholderCard,
    alt: 'Tournament placeholder',
    priority,
  };
};

/**
 * Get tournament image with proper fallback logic for share/hero displays
 * Priority: share_cover_url → banner_url → placeholder
 */
export const getTournamentShareImage = (tournament: Tournament): TournamentImage => {
  const priority = shouldPrioritizeTournament(tournament);

  // First priority: share_cover_url (optimized for sharing)
  if (tournament.share_cover_url) {
    return {
      src: tournament.share_cover_url,
      alt: tournament.share_cover_alt || `Tournament: ${tournament.name}`,
      priority,
    };
  }

  // Second priority: banner_url
  if (tournament.banner_url) {
    return {
      src: tournament.banner_url,
      alt: tournament.share_cover_alt || `Tournament: ${tournament.name}`,
      priority,
    };
  }

  // Fallback: branded placeholder for share format
  return {
    src: placeholderShare,
    alt: 'Tournament placeholder',
    priority,
  };
};

/**
 * Get OG/meta image with proper fallback logic
 * Priority: share_cover_url → banner_url → placeholder
 */
export const getTournamentOGImage = (tournament: Tournament): string => {
  return tournament.share_cover_url || tournament.banner_url || placeholderShare;
};

/**
 * Get tournament alt text with proper fallback
 */
export const getTournamentAltText = (tournament: Tournament, isPlaceholder = false): string => {
  if (isPlaceholder) {
    return 'Tournament placeholder';
  }
  return tournament.share_cover_alt || `Tournament: ${tournament.name}`;
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