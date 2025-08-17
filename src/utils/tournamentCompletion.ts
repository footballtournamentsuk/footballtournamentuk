import { Tournament } from '@/types/tournament';

// Define the key fields that contribute to completion percentage
const COMPLETION_FIELDS = [
  'banner_url',
  'extended_description',
  'venue_details', 
  'rules_and_regulations',
  'schedule_details',
  'what_to_bring',
  'accommodation_info',
  'prize_information',
  'sponsor_info',
  'additional_notes'
] as const;

/**
 * Calculate the completion percentage of a tournament's extended details
 * @param tournament - The tournament object
 * @returns completion percentage (0-100)
 */
export const calculateTournamentCompletion = (tournament: any): number => {
  if (!tournament) return 0;
  
  let completedFields = 0;
  const totalFields = COMPLETION_FIELDS.length;
  
  COMPLETION_FIELDS.forEach(field => {
    const value = tournament[field];
    if (value && (typeof value === 'string' ? value.trim().length > 0 : true)) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Get completion status with color styling
 * @param percentage - completion percentage
 * @returns object with status text and color class
 */
export const getCompletionStatus = (percentage: number) => {
  if (percentage >= 80) {
    return { 
      text: `${percentage}% Complete`,
      colorClass: 'bg-green-100 text-green-800 border-green-200',
      variant: 'default' as const
    };
  } else if (percentage >= 50) {
    return { 
      text: `${percentage}% Complete`,
      colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'secondary' as const
    };
  } else {
    return { 
      text: `${percentage}% Complete`,
      colorClass: 'bg-red-100 text-red-800 border-red-200', 
      variant: 'outline' as const
    };
  }
};