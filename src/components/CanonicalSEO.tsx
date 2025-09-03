import React from 'react';
import { Helmet } from 'react-helmet-async';

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

export interface CanonicalSEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
  nofollow?: boolean;
  noCache?: boolean;
}

/**
 * Enhanced SEO component with proper canonical URL and robots handling
 */
export const CanonicalSEO: React.FC<CanonicalSEOProps> = ({
  title,
  description,
  canonicalPath,
  noindex = false,
  nofollow = false,
  noCache = false
}) => {
  const canonicalUrl = generateCanonicalUrl(canonicalPath);
  const robotsContent = generateRobotsContent({ noindex, nofollow });

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={robotsContent} />
      
      {noCache && (
        <>
          <meta name="cache-control" content="no-store, no-cache, must-revalidate" />
          <meta httpEquiv="cache-control" content="no-store, no-cache, must-revalidate" />
          <meta httpEquiv="pragma" content="no-cache" />
          <meta httpEquiv="expires" content="0" />
        </>
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};