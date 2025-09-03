import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tournament } from '@/types/tournament';
import { CityConfig } from '@/data/cities';
import { getTournamentThumbnail } from '@/utils/tournamentThumbnails';

interface EnhancedSEOProps {
  city: CityConfig;
  tournaments: Tournament[];
  pageType: 'city' | 'tournament' | 'home';
  additionalKeywords?: string[];
}

export const EnhancedSEO: React.FC<EnhancedSEOProps> = ({
  city,
  tournaments,
  pageType,
  additionalKeywords = []
}) => {
  const siteUrl = 'https://footballtournamentsuk.co.uk';
  const canonicalUrl = `${siteUrl}/city/${city.slug}`;
  const heroImageUrl = city.heroImage ? `${siteUrl}/assets/cities/${city.heroImage}` : `${siteUrl}/og-image.jpg`;

  // Enhanced structured data for city pages
  const generateLocalBusinessSchema = () => ({
    '@type': 'LocalBusiness',
    '@context': 'https://schema.org',
    name: `Youth Football Tournaments ${city.displayName}`,
    description: `Professional youth football tournament services in ${city.displayName}, ${city.region}. Organizing quality tournaments for age groups U6 to U21.`,
    image: heroImageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.displayName,
      addressRegion: city.region,
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.coordinates[1],
      longitude: city.coordinates[0]
    },
    url: canonicalUrl,
    areaServed: {
      '@type': 'City',
      name: city.displayName
    },
    serviceType: 'Youth Football Tournaments'
  });

  // FAQ Schema for better search snippets
  const generateFAQSchema = () => ({
    '@type': 'FAQPage',
    '@context': 'https://schema.org',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I find youth football tournaments in ${city.displayName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can find youth football tournaments in ${city.displayName} by browsing our comprehensive tournament directory. We list all age groups from U6 to U21, with various formats including 3v3, 5v5, 7v7, 9v9, and 11v11 competitions throughout ${city.region}.`
        }
      },
      {
        '@type': 'Question',
        name: `What age groups are available for youth football tournaments in ${city.displayName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Youth football tournaments in ${city.displayName} cater to all age groups from U6 (under 6) to U21 (under 21). Each tournament specifies the eligible age categories, ensuring appropriate competition levels for all young players.`
        }
      },
      {
        '@type': 'Question',
        name: `How much do youth football tournaments in ${city.displayName} cost?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Tournament costs in ${city.displayName} vary depending on the format, duration, and included services. Many tournaments offer competitive pricing with options for different budgets. Check individual tournament listings for specific pricing information.`
        }
      }
    ]
  });

  // Enhanced tournament events schema
  const generateTournamentEventsSchema = () => tournaments.slice(0, 5).map(tournament => {
    const thumbnail = getTournamentThumbnail(tournament);
    const tournamentImageUrl = `${siteUrl}/${thumbnail.src}`;
    
    return {
      '@type': 'SportsEvent',
      '@context': 'https://schema.org',
      name: tournament.name,
      description: `${tournament.format} youth football tournament in ${city.displayName}. ${tournament.description || `Professional youth football competition in ${tournament.location.name}.`}`,
      image: tournamentImageUrl,
      startDate: tournament.dates.start.toISOString(),
      endDate: tournament.dates.end.toISOString(),
      location: {
        '@type': 'Place',
        name: tournament.location.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.displayName,
          addressRegion: city.region,
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
      sport: 'Association Football',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      url: `${siteUrl}/tournaments/${tournament.id}`,
      offers: tournament.cost ? {
        '@type': 'Offer',
        price: tournament.cost.amount,
        priceCurrency: tournament.cost.currency,
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString(),
        url: `${siteUrl}/tournaments/${tournament.id}`
      } : {
        '@type': 'Offer',
        price: 0,
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock'
      },
      audience: {
        '@type': 'Audience',
        audienceType: 'Youth Football Players',
        geographicArea: {
          '@type': 'City',
          name: city.displayName
        }
      }
    };
  });

  // Breadcrumb schema
  const generateBreadcrumbSchema = () => ({
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
        name: 'UK Cities',
        item: `${siteUrl}/#cities`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${city.displayName} Football Tournaments`,
        item: canonicalUrl
      }
    ]
  });

  // Generate comprehensive keywords
  const generateKeywords = () => {
    const baseKeywords = [
      `youth football tournaments ${city.displayName}`,
      `football tournaments ${city.region}`,
      `youth football ${city.displayName}`,
      `football competitions ${city.displayName}`,
      `youth soccer tournaments ${city.displayName}`,
      '3v3 football tournaments',
      '5v5 football tournaments',
      '7v7 football tournaments',
      '9v9 football tournaments',
      '11v11 football tournaments',
      'youth football development',
      'grassroots football',
      'junior football tournaments',
      `football clubs ${city.displayName}`,
      `youth sports ${city.displayName}`
    ];
    
    return [...baseKeywords, ...additionalKeywords].join(', ');
  };

  const schemas = [
    generateLocalBusinessSchema(),
    generateFAQSchema(),
    generateBreadcrumbSchema(),
    ...generateTournamentEventsSchema()
  ];

  return (
    <Helmet>
      {/* Enhanced Meta Tags */}
      <meta name="keywords" content={generateKeywords()} />
      <meta name="author" content="Football Tournaments UK" />
      <meta name="publisher" content="Football Tournaments UK" />
      
      {/* Geographic Meta Tags */}
      <meta name="geo.region" content="GB" />
      <meta name="geo.placename" content={city.displayName} />
      <meta name="geo.position" content={`${city.coordinates[1]};${city.coordinates[0]}`} />
      <meta name="ICBM" content={`${city.coordinates[1]}, ${city.coordinates[0]}`} />
      
      {/* Local Business Meta Tags */}
      <meta name="business.name" content={`Youth Football Tournaments ${city.displayName}`} />
      <meta name="business.type" content="Sports Organization" />
      <meta name="business.location" content={`${city.displayName}, ${city.region}`} />
      
      {/* Enhanced Open Graph */}
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`Youth Football Tournaments in ${city.displayName} | Football Tournaments UK`} />
      <meta property="og:description" content={city.seoDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={heroImageUrl} />
      <meta property="og:image:alt" content={city.heroAltText || `Youth football in ${city.displayName}`} />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1080" />
      <meta property="og:site_name" content="Football Tournaments UK" />
      <meta property="article:publisher" content="Football Tournaments UK" />
      <meta property="article:author" content="Football Tournaments UK" />
      
      {/* Twitter Card Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@footballtournamentsuk" />
      <meta name="twitter:creator" content="@footballtournamentsuk" />
      <meta name="twitter:domain" content="footballtournamentsuk.co.uk" />
      <meta name="twitter:title" content={`Youth Football Tournaments in ${city.displayName}`} />
      <meta name="twitter:description" content={city.seoDescription} />
      <meta name="twitter:image" content={heroImageUrl} />
      <meta name="twitter:image:alt" content={city.heroAltText || `Youth football in ${city.displayName}`} />
      
      {/* Schema.org JSON-LD */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Alternative language versions if applicable */}
      <link rel="alternate" href={canonicalUrl} hrefLang="en-gb" />
      <link rel="alternate" href={canonicalUrl} hrefLang="en" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};