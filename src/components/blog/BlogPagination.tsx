import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlogPagination as PaginationType } from '@/types/blog'
import { generatePageUrl } from '@/utils/blogUtils'

interface BlogPaginationProps {
  pagination: PaginationType
  baseUrl?: string
  className?: string
}

export function BlogPagination({ pagination, baseUrl = '/blog', className }: BlogPaginationProps) {
  const { currentPage, totalPages, hasPrev, hasNext } = pagination

  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    if (baseUrl !== '/blog') {
      return `${baseUrl}?page=${page}`
    }
    return generatePageUrl(page)
  }

  const generatePageNumbers = () => {
    const pages = []
    const showPages = 5 // Show max 5 page numbers
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className || ''}`}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={!hasPrev}
        className={!hasPrev ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {hasPrev ? (
          <Link to={getPageUrl(currentPage - 1)} className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </span>
        )}
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {generatePageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link to={getPageUrl(page as number)} className="min-w-[2rem]">
                  {page}
                </Link>
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={!hasNext}
        className={!hasNext ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {hasNext ? (
          <Link to={getPageUrl(currentPage + 1)} className="flex items-center gap-1">
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1">
            Next
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </Button>
    </div>
  )
}