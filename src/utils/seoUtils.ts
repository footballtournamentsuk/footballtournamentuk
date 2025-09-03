/**
 * SEO utilities for canonical URLs and robots meta tags
 */

export interface SEOConfig {
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  noCache?: boolean;
}

/**
 * Generate canonical URL ensuring proper format
 */
export const generateCanonicalUrl = (path?: string): string => {
  const siteUrl = 'https://footballtournamentsuk.co.uk';
  
  if (!path) {
    return `${siteUrl}${window.location.pathname}`;
  }
  
  // If already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${siteUrl}${normalizedPath}`;
};

/**
 * Generate robots meta content
 */
export const generateRobotsContent = (config: { noindex?: boolean; nofollow?: boolean }): string => {
  const directives = [];
  
  if (config.noindex) {
    directives.push('noindex');
  } else {
    directives.push('index');
  }
  
  if (config.nofollow) {
    directives.push('nofollow');
  } else {
    directives.push('follow');
  }
  
  return directives.join(', ');
};

/**
 * Check if a page should be indexed based on its path
 */
export const shouldIndexPage = (pathname: string): boolean => {
  const noIndexPaths = [
    '/alerts/verify',
    '/alerts/manage',
    '/auth',
    '/profile',
    '/admin'
  ];
  
  // Check for exact matches or path prefixes
  return !noIndexPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
};

/**
 * Get SEO configuration for a given page
 */
export const getPageSEOConfig = (pathname: string): SEOConfig => {
  const shouldIndex = shouldIndexPage(pathname);
  
  return {
    canonical: generateCanonicalUrl(pathname),
    noindex: !shouldIndex,
    nofollow: !shouldIndex,
    noCache: !shouldIndex
  };
};