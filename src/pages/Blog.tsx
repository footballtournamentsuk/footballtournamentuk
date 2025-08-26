import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Search, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { BlogPagination } from '@/components/blog/BlogPagination'
import { BlogSEO } from '@/components/blog/BlogSEO'
import { useBlogPosts, useBlogTags } from '@/hooks/useBlog'

// Check if blog is enabled
const BLOG_ENABLED = import.meta.env.VITE_BLOG_ENABLED === 'true'

export default function Blog() {
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

  const { pageNumber } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const currentPage = pageNumber ? parseInt(pageNumber) : 1
  const searchQuery = searchParams.get('search') || ''
  
  const { posts, pagination, loading, error } = useBlogPosts({
    page: currentPage,
    search: searchQuery || undefined
  })
  
  const { tags } = useBlogTags()

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (query) {
      newParams.set('search', query)
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams)
  }

  const clearSearch = () => {
    setSearchParams({})
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Blog</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <BlogSEO 
        isListingPage 
        currentPage={currentPage} 
        totalPages={pagination.totalPages}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Football Tournaments UK Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Latest news, insights, and updates from the UK's leading football tournament platform
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear Search
                </Button>
              )}
            </div>

            {/* Popular Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Popular tags:</span>
                {tags.slice(0, 8).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleSearch(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                {pagination.totalPosts} result{pagination.totalPosts !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            </div>
          )}

          {/* Blog Grid */}
          <BlogGrid posts={posts} loading={loading} className="mb-12" />

          {/* Pagination */}
          <BlogPagination pagination={pagination} />
        </div>
      </div>
    </>
  )
}