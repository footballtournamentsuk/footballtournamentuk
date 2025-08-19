import { Tournament } from '@/types/tournament';

/**
 * Check if a tournament is a demo tournament
 */
export const isDemoTournament = (tournament: Tournament): boolean => {
  return tournament.organizerId === 'demo' || tournament.id.startsWith('demo-');
};

/**
 * Check if we should exclude demos from analytics/exports
 */
export const shouldExcludeFromAnalytics = (tournament: Tournament): boolean => {
  return isDemoTournament(tournament);
};