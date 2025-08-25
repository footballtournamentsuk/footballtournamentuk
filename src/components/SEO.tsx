import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getTournamentOGImage } from '@/utils/tournamentThumbnails';
import { Tournament } from '@/types/tournament';
import { isDemoTournament } from '@/utils/demoUtils';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  tournaments?: Tournament[];
  cityName?: string;
  isHomePage?: boolean;
  isCityPage?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  tournaments = [],
  cityName,
  isHomePage = false,
  isCityPage = false
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
    logo: `${siteUrl}/bimi-logo.svg`,
    sameAs: [
      'https://www.instagram.com/footballtournamentuk/',
      'https://www.facebook.com/profile.php?id=61579443724038'
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

  // Generate tournament formats schema for city pages
  const tournamentFormatsSchema = isCityPage && cityName ? {
    '@type': 'Event',
    '@context': 'https://schema.org',
    name: `Youth Football Tournament Formats in ${cityName}`,
    description: `Multiple football tournament formats available in ${cityName} including 3v3, 5v5, 7v7, 9v9, and 11v11 competitions`,
    sport: 'Football',
    location: {
      '@type': 'Place',
      name: cityName,
      addressRegion: 'United Kingdom',
      addressCountry: 'GB'
    },
    offers: [
      { '@type': 'Offer', name: '3v3 Football Tournaments', description: 'Small-sided games perfect for young players' },
      { '@type': 'Offer', name: '5v5 Football Tournaments', description: 'Popular format for youth development' },
      { '@type': 'Offer', name: '7v7 Football Tournaments', description: 'Standard format for junior leagues' },
      { '@type': 'Offer', name: '9v9 Football Tournaments', description: 'Semi-professional youth format' },
      { '@type': 'Offer', name: '11v11 Football Tournaments', description: 'Full-size pitch professional format' }
    ]
  } : null;

  // Generate age groups schema for city pages
  const ageGroupsSchema = isCityPage && cityName ? {
    '@type': 'Event',
    '@context': 'https://schema.org',
    name: `Youth Football Age Groups in ${cityName}`,
    description: `Comprehensive youth football development programs in ${cityName} for all age groups from U6 to U21`,
    sport: 'Football',
    location: {
      '@type': 'Place',
      name: cityName,
      addressRegion: 'United Kingdom',
      addressCountry: 'GB'
    },
    audience: [
      { '@type': 'Audience', name: 'U6 Football', description: 'Under 6 years old football development' },
      { '@type': 'Audience', name: 'U7 Football', description: 'Under 7 years old youth football' },
      { '@type': 'Audience', name: 'U8 Football', description: 'Under 8 years old junior tournaments' },
      { '@type': 'Audience', name: 'U9 Football', description: 'Under 9 years old competitive football' },
      { '@type': 'Audience', name: 'U10 Football', description: 'Under 10 years old youth development' },
      { '@type': 'Audience', name: 'U11 Football', description: 'Under 11 years old junior competitions' },
      { '@type': 'Audience', name: 'U12 Football', description: 'Under 12 years old youth tournaments' },
      { '@type': 'Audience', name: 'U13 Football', description: 'Under 13 years old teenage football' },
      { '@type': 'Audience', name: 'U14 Football', description: 'Under 14 years old junior leagues' },
      { '@type': 'Audience', name: 'U15 Football', description: 'Under 15 years old youth competitions' },
      { '@type': 'Audience', name: 'U16 Football', description: 'Under 16 years old teenage tournaments' },
      { '@type': 'Audience', name: 'U18 Football', description: 'Under 18 years old youth football' },
      { '@type': 'Audience', name: 'U21 Football', description: 'Under 21 years old development leagues' }
    ]
  } : null;

  const schemas = [
    ...tournamentSchemas,
    organizationSchema,
    breadcrumbSchema,
    tournamentFormatsSchema,
    ageGroupsSchema
  ].filter(Boolean);

  // Generate dynamic OG image URL for tournaments
  const getOgImageUrl = () => {
    if (tournaments.length === 1) {
      const tournament = tournaments[0];
      // Use proper fallback chain: share_cover_url → banner_url → placeholder → dynamic generation
      return getTournamentOGImage(tournament) || `${siteUrl}/functions/v1/generate-og-image?tournamentId=${tournament.id}`;
    }
    // Default OG image for other pages
    return `${siteUrl}/og-image.jpg`;
  };

  const ogImageUrl = getOgImageUrl();

  // Check if this is a demo tournament page
  const isDemoPage = tournaments.length === 1 && isDemoTournament(tournaments[0]);

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
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Football Tournaments UK" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content={isDemoPage ? "noindex, nofollow" : "index, follow"} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="GB" />
      <meta name="geo.placename" content="United Kingdom" />
      <meta name="theme-color" content="#16a34a" />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      
      {/* Schema.org JSON-LD */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};