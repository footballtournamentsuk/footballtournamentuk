import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { BlogPagination } from '@/components/blog/BlogPagination'
import { BlogSEO } from '@/components/blog/BlogSEO'
import { useBlogPosts } from '@/hooks/useBlog'
import { generatePageUrl } from '@/utils/blogUtils'

// Check if blog is enabled
const BLOG_ENABLED = import.meta.env.VITE_BLOG_ENABLED === 'true'

export default function BlogTag() {
  if (!BLOG_ENABLED) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Coming Soon</h1>
          <p className="text-muted-foreground">
            Our blog feature is currently under development.
          </p>
        </div>
      </div>
    )
  }

  const { tag } = useParams<{ tag: string }>()
  const decodedTag = decodeURIComponent(tag || '')
  
  const { posts, pagination, loading, error } = useBlogPosts({
    tag: decodedTag,
    page: 1
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Posts</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild className="mt-4">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const baseUrl = `/blog/tags/${encodeURIComponent(decodedTag)}`

  return (
    <>
      <BlogSEO 
        isListingPage 
        tag={decodedTag}
        currentPage={1}
        totalPages={pagination.totalPages}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back to Blog */}
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Tag className="w-6 h-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                {decodedTag}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {pagination.totalPosts} post{pagination.totalPosts !== 1 ? 's' : ''} tagged with "{decodedTag}"
            </p>
          </div>

          {/* Posts Grid */}
          <BlogGrid posts={posts} loading={loading} className="mb-12" />

          {/* Pagination */}
          <BlogPagination 
            pagination={pagination} 
            baseUrl={baseUrl}
          />
        </div>
      </div>
    </>
  )
}