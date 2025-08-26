import React from 'react'
import { Helmet } from 'react-helmet-async'
import { BlogPost } from '@/types/blog'
import { getBlogSEOData } from '@/utils/blogUtils'

interface BlogSEOProps {
  post?: BlogPost
  isListingPage?: boolean
  currentPage?: number
  tag?: string
  totalPages?: number
}

export function BlogSEO({ post, isListingPage, currentPage = 1, tag, totalPages = 1 }: BlogSEOProps) {
  const baseUrl = 'https://footballtournamentsuk.co.uk'
  
  if (post) {
    // Individual blog post SEO
    const seoData = getBlogSEOData(post)
    
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: seoData.title,
      description: seoData.description,
      image: seoData.ogImage,
      author: {
        '@type': 'Person',
        name: seoData.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'Football Tournaments UK',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`
        }
      },
      datePublished: seoData.publishedAt,
      dateModified: seoData.updatedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': seoData.canonicalUrl
      }
    }

    return (
      <Helmet>
        <title>{seoData.title} | Football Tournaments UK Blog</title>
        <meta name="description" content={seoData.description} />
        <link rel="canonical" href={seoData.canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:url" content={seoData.canonicalUrl} />
        <meta property="article:published_time" content={seoData.publishedAt} />
        <meta property="article:modified_time" content={seoData.updatedAt} />
        <meta property="article:author" content={seoData.author} />
        {seoData.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.ogImage} />
        
        {/* Language and locale */}
        <meta httpEquiv="Content-Language" content="en-GB" />
        <link rel="alternate" hrefLang="en-GB" href={seoData.canonicalUrl} />
        
        {/* Additional meta */}
        <meta name="author" content={seoData.author} />
        {seoData.readingTime && (
          <meta name="twitter:label1" content="Reading time" />
        )}
        {seoData.readingTime && (
          <meta name="twitter:data1" content={`${seoData.readingTime} min read`} />
        )}
        
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
    )
  }

  // Blog listing page SEO
  let title = 'Football Tournaments UK Blog'
  let description = 'Latest news, insights, and updates from the UK\'s leading football tournament platform'
  let canonicalUrl = `${baseUrl}/blog`
  
  if (tag) {
    title = `${tag} Posts | Football Tournaments UK Blog`
    description = `Latest blog posts about ${tag} from Football Tournaments UK`
    canonicalUrl = `${baseUrl}/blog/tags/${encodeURIComponent(tag)}`
  } else if (currentPage > 1) {
    title = `Blog - Page ${currentPage} | Football Tournaments UK`
    canonicalUrl = `${baseUrl}/blog/page/${currentPage}`
  }

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Football Tournaments UK Blog',
    description: 'Latest news, insights, and updates from the UK\'s leading football tournament platform',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Football Tournaments UK',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    }
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Pagination */}
      {currentPage > 1 && (
        <link rel="prev" href={currentPage === 2 ? `${baseUrl}/blog` : `${baseUrl}/blog/page/${currentPage - 1}`} />
      )}
      {currentPage < totalPages && (
        <link rel="next" href={`${baseUrl}/blog/page/${currentPage + 1}`} />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${baseUrl}/og-image.jpg`} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}/og-image.jpg`} />
      
      {/* Language and locale */}
      <meta httpEquiv="Content-Language" content="en-GB" />
      <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
      
      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title="Football Tournaments UK Blog RSS" href={`${baseUrl}/blog/feed.xml`} />
      
      <script type="application/ld+json">
        {JSON.stringify(blogJsonLd)}
      </script>
    </Helmet>
  )
}