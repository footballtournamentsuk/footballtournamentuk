import { Tournament } from '@/types/tournament';

export interface TournamentThumbnail {
  src: string;
  alt: string;
  priority?: boolean;
}

/**
 * Get the appropriate thumbnail image for a tournament based on custom banner or generate placeholder
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

  // Use optimized WebP image from assets
  const defaultImage = '/src/assets/hero-football.webp';
  
  return {
    src: defaultImage,
    alt: `${tournament.format} ${tournament.type} tournament in ${tournament.location.name} - ${tournament.name}`,
    priority: shouldPrioritizeTournament(tournament),
  };
};

/**
 * Generate a placeholder thumbnail with tournament info
 */
export const generatePlaceholderThumbnail = (tournament: Tournament): string => {
  // This could be enhanced to generate dynamic thumbnails
  // For now, return a consistent optimized placeholder
  return '/src/assets/hero-football.webp';
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