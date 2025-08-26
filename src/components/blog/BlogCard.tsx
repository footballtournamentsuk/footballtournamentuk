import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { BlogPost } from '@/types/blog'
import { formatReadingTime, formatPublishDate, generateBlogPostUrl, generateTagUrl } from '@/utils/blogUtils'
import { getAuthorDisplayName } from '@/utils/authorUtils'

interface BlogCardProps {
  post: BlogPost
  className?: string
}

export function BlogCard({ post, className }: BlogCardProps) {
  const postUrl = generateBlogPostUrl(post.slug)
  const publishDate = formatPublishDate(post.published_at)
  const readingTime = formatReadingTime(post.reading_time)
  const author = getAuthorDisplayName(post.author_id, post.profiles)
  
  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 overflow-hidden ${className || ''}`}>
      <Link to={postUrl} className="block">
        <div className="aspect-video relative overflow-hidden">
          {post.cover_image_url ? (
            <OptimizedImage
              src={post.cover_image_url}
              alt={post.cover_alt || post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-muted-foreground text-sm font-medium">
                {post.title.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          
          {post.is_pinned && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              Pinned
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to={generateTagUrl(tag)}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:opacity-80 transition-opacity"
                >
                  <Badge variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                </Link>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Title */}
          <Link to={postUrl}>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Meta information */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>By Admin</span>
              </div>
              
              {publishDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{publishDate}</span>
                </div>
              )}
              
              {readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{readingTime}</span>
                </div>
              )}
            </div>

            {/* Likes count */}
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{post.likes_count || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}