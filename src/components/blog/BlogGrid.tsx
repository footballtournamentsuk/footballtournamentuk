import React from 'react'
import { BlogCard } from './BlogCard'
import { BlogCardSkeleton } from './BlogCardSkeleton'
import { BlogPost } from '@/types/blog'

interface BlogGridProps {
  posts: BlogPost[]
  loading?: boolean
  className?: string
}

export function BlogGrid({ posts, loading, className }: BlogGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ''}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <BlogCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className || ''}`}>
        <p className="text-muted-foreground text-lg">No blog posts found.</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ''}`}>
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  )
}