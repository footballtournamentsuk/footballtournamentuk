import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tournament } from '@/types/tournament';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  tournaments?: Tournament[];
  cityName?: string;
  isHomePage?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  tournaments = [],
  cityName,
  isHomePage = false
}) => {
  const siteUrl = 'https://footballtournamentsuk.co.uk';
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : undefined;

  // Generate tournament schema markup
  const tournamentSchemas = tournaments.slice(0, 5).map(tournament => ({
    '@type': 'SportsEvent',
    '@context': 'https://schema.org',
    name: tournament.name,
    description: tournament.description || `${tournament.format} youth football tournament in ${tournament.location.name}`,
    startDate: tournament.dates.start.toISOString(),
    endDate: tournament.dates.end.toISOString(),
    location: {
      '@type': 'Place',
      name: tournament.location.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: tournament.location.name,
        addressRegion: tournament.location.region,
        postalCode: tournament.location.postcode,
        addressCountry: 'GB'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: tournament.location.coordinates[1],
        longitude: tournament.location.coordinates[0]
      }
    },
    organizer: {
      '@type': 'Organization',
      name: tournament.contact.name,
      email: tournament.contact.email,
      telephone: tournament.contact.phone
    },
    offers: tournament.cost ? {
      '@type': 'Offer',
      price: tournament.cost.amount,
      priceCurrency: tournament.cost.currency,
      url: `${siteUrl}/tournaments/${tournament.id}`
    } : undefined,
    sport: 'Football',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url: `${siteUrl}/tournaments/${tournament.id}`
  }));

  // Generate organization schema for homepage
  const organizationSchema = isHomePage ? {
    '@type': 'Organization',
    '@context': 'https://schema.org',
    name: 'Football Tournaments UK',
    description: 'Find and join football tournaments across the UK. Free listings for organizers – no fees, no contracts.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://facebook.com/footballtournamentsuk',
      'https://twitter.com/footballtournamentsuk',
      'https://instagram.com/footballtournamentsuk'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@footballtournamentsuk.co.uk'
    }
  } : null;

  // Generate breadcrumb schema for city pages
  const breadcrumbSchema = cityName ? {
    '@type': 'BreadcrumbList',
    '@context': 'https://schema.org',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tournaments',
        item: `${siteUrl}/tournaments`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${cityName} Tournaments`,
        item: fullCanonicalUrl
      }
    ]
  } : null;

  const schemas = [
    ...tournamentSchemas,
    organizationSchema,
    breadcrumbSchema
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonicalUrl || siteUrl} />
      <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
      <meta property="og:site_name" content="Football Tournaments UK" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/og-image.jpg`} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      
      {/* Schema.org JSON-LD */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};