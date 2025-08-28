// Type helper utilities for Supabase operations when types are not available

// Helper function to cast Supabase results when types are unavailable
export const castSupabaseResult = <T>(data: any): T => {
  return data as T;
};

// Helper function to safely access properties from Supabase results
export const safelyAccessProperty = (obj: any, property: string, defaultValue: any = null) => {
  return obj && typeof obj === 'object' && obj[property] !== undefined ? obj[property] : defaultValue;
};

// Helper to cast Supabase query parameters
export const castQueryParam = (value: any): any => {
  return value as any;
};