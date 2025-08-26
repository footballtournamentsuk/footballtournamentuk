import React from 'react'
import { Calendar, Clock, User, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { BlogPost } from '@/types/blog'
import { formatReadingTime, formatPublishDate } from '@/utils/blogUtils'
import { getAuthorDisplayName } from '@/utils/authorUtils'

interface BlogHeroProps {
  post: BlogPost
}

export function BlogHero({ post }: BlogHeroProps) {
  const publishDate = formatPublishDate(post.published_at)
  const readingTime = formatReadingTime(post.reading_time)
  const author = getAuthorDisplayName(post.author_id, post.profiles)

  return (
    <div className="relative">
      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="aspect-[2/1] lg:aspect-[3/1] relative overflow-hidden rounded-lg mb-8">
          <OptimizedImage
            src={post.cover_image_url}
            alt={post.cover_alt || post.title}
            className="object-cover w-full h-full"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
          />
          
          {post.is_pinned && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              Pinned Post
            </Badge>
          )}
        </div>
      )}

      {/* Article Header */}
      <header className="space-y-6">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {post.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t pt-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>By {author}</span>
          </div>
          
          {publishDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{publishDate}</span>
            </div>
          )}
          
          {readingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>{post.likes_count || 0} likes</span>
          </div>
        </div>
      </header>
    </div>
  )
}