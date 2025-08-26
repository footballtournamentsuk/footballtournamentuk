import { BlogPost } from '@/types/blog'
import { getAuthorDisplayName, getMetaAuthor } from './authorUtils'

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getOrCreateSessionId(): string {
  const key = 'blog_session_id'
  let sessionId = localStorage.getItem(key)
  
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem(key, sessionId)
  }
  
  return sessionId
}

export function formatReadingTime(minutes?: number): string {
  if (!minutes) return ''
  return minutes === 1 ? '1 min read' : `${minutes} min read`
}

export function formatPublishDate(dateString?: string): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function generateBlogPostUrl(slug: string): string {
  return `/blog/${slug}`
}

export function generateTagUrl(tag: string): string {
  return `/blog/tags/${encodeURIComponent(tag)}`
}

export function generatePageUrl(page: number): string {
  return page === 1 ? '/blog' : `/blog/page/${page}`
}

export function extractExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown syntax and get plain text
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  if (plainText.length <= maxLength) return plainText
  
  const trimmed = plainText.substring(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')
  
  return lastSpace > 0 ? trimmed.substring(0, lastSpace) + '...' : trimmed + '...'
}

export function generateTableOfContents(content: string): Array<{ id: string; title: string; level: number }> {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const toc: Array<{ id: string; title: string; level: number }> = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    toc.push({ id, title, level })
  }

  return toc
}

export function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[], limit: number = 4): BlogPost[] {
  if (!currentPost.tags || currentPost.tags.length === 0) {
    // If no tags, return most recent posts
    return allPosts
      .filter(post => post.id !== currentPost.id)
      .slice(0, limit)
  }

  // Score posts by shared tags
  const scored = allPosts
    .filter(post => post.id !== currentPost.id)
    .map(post => {
      const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag))
      return {
        post,
        score: sharedTags.length
      }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // First by score (shared tags), then by publish date
      if (a.score === b.score) {
        return new Date(b.post.published_at || 0).getTime() - new Date(a.post.published_at || 0).getTime()
      }
      return b.score - a.score
    })

  const related = scored.slice(0, limit).map(item => item.post)
  
  // Fill remaining slots with recent posts if needed
  if (related.length < limit) {
    const remaining = allPosts
      .filter(post => 
        post.id !== currentPost.id && 
        !related.some(r => r.id === post.id)
      )
      .slice(0, limit - related.length)
    
    related.push(...remaining)
  }

  return related
}

export function getBlogSEOData(post: BlogPost) {
  const baseUrl = 'https://footballtournamentsuk.co.uk'
  const postUrl = `${baseUrl}/blog/${post.slug}`
  
  return {
    title: post.title,
    description: post.excerpt || extractExcerpt(post.content || '', 160),
    canonicalUrl: post.canonical_url || postUrl,
    ogImage: post.og_image_url || post.cover_image_url || `${baseUrl}/og-image.jpg`,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    author: getMetaAuthor(post.author_id),
    tags: post.tags,
    readingTime: post.reading_time
  }
}