import React from 'react';
import { Helmet } from 'react-helmet-async';

interface UnifiedSEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  structuredData?: Record<string, any>[];
  keywords?: string;
}

export const UnifiedSEO: React.FC<UnifiedSEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://footballtournamentsuk.co.uk/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  structuredData = [],
  keywords
}) => {
  const fullUrl = canonicalUrl.startsWith('http') 
    ? canonicalUrl 
    : `https://footballtournamentsuk.co.uk${canonicalUrl}`;

  const baseTitle = 'Football Tournaments UK';
  const fullTitle = title.includes(baseTitle) ? title : `${title} | ${baseTitle}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={baseTitle} />
      <meta property="og:locale" content="en_GB" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@FootballTournamentsUK" />
      <meta name="twitter:creator" content="@FootballTournamentsUK" />
      
      {/* Additional Meta */}
      <meta name="language" content="English" />
      <meta httpEquiv="content-language" content="en-GB" />
      
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
