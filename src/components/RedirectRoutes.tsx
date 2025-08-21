import { Navigate, useParams } from 'react-router-dom';

// Component to handle 301 redirects from old /tournaments/{city} URLs to new /city/{slug} format
export const TournamentCityRedirect = () => {
  const { city } = useParams<{ city: string }>();
  
  // Map of old city names to new slugs for proper redirection
  const cityMapping: Record<string, string> = {
    'london': 'london',
    'manchester': 'manchester', 
    'birmingham': 'birmingham',
    'liverpool': 'liverpool',
    'leeds': 'leeds',
    'glasgow': 'glasgow',
    'newcastle-upon-tyne': 'newcastle',
    'sheffield': 'sheffield',
    'bristol': 'bristol',
    'nottingham': 'nottingham',
    'leicester': 'leicester',
    'brighton': 'brighton'
  };
  
  const newSlug = cityMapping[city || ''];
  
  if (newSlug) {
    // 301 redirect to new URL format
    return <Navigate to={`/city/${newSlug}`} replace />;
  }
  
  // If city not found, redirect to 404
  return <Navigate to="/404" replace />;
};