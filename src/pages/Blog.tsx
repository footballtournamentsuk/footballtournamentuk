import React, { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Search, Tag, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [showAllTags, setShowAllTags] = useState(false)
  
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Popular tags:</span>
                </div>
                
                <div className="relative">
                  <div className={`flex flex-wrap gap-2 ${!showAllTags ? 'max-h-16 sm:max-h-none overflow-hidden' : ''}`}>
                    {(showAllTags ? tags : tags.slice(0, 8)).map((tag) => (
                      <Badge
                        key={tag}
                        variant="glass"
                        className="cursor-pointer text-xs h-7 px-3 py-1.5 rounded-full sm:text-sm sm:h-auto sm:px-2.5 sm:py-0.5"
                        onClick={() => handleSearch(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {tags.length > 8 && (
                    <div className="sm:hidden mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllTags(!showAllTags)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {showAllTags ? (
                          <>
                            Show less <ChevronUp className="w-3 h-3 ml-1" />
                          </>
                        ) : (
                          <>
                            Show more <ChevronDown className="w-3 h-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
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