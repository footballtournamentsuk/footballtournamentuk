import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogContent } from '@/components/blog/BlogContent'
import { BlogTableOfContents } from '@/components/blog/BlogTableOfContents'
import { BlogLikeButton } from '@/components/blog/BlogLikeButton'
import { BlogSEO } from '@/components/blog/BlogSEO'
import { BlogCard } from '@/components/blog/BlogCard'
import { useBlogPost, useBlogPosts } from '@/hooks/useBlog'
import { getRelatedPosts } from '@/utils/blogUtils'
import { useToast } from '@/hooks/use-toast'

// Check if blog is enabled
const BLOG_ENABLED = import.meta.env.VITE_BLOG_ENABLED === 'true'

export default function BlogPost() {
  if (!BLOG_ENABLED) {
    return <Navigate to="/404" replace />
  }

  const { slug } = useParams<{ slug: string }>()
  const { toast } = useToast()
  
  const { post, loading, error } = useBlogPost(slug!)
  const { posts: allPosts } = useBlogPosts({ limit: 100 }) // Get more posts for related calculation
  
  const relatedPosts = post ? getRelatedPosts(post, allPosts, 4) : []

  const handleShare = async () => {
    if (!post) return

    const shareData = {
      title: post.title,
      text: post.excerpt || 'Check out this blog post from Football Tournaments UK',
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "The blog post link has been copied to your clipboard.",
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="aspect-[2/1] bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-full"></div>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <BlogSEO post={post} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back to Blog */}
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Hero Section */}
              <BlogHero post={post} />

              {/* Article Actions */}
              <div className="flex items-center justify-between py-4 border-y">
                <BlogLikeButton 
                  postId={post.id} 
                  initialLikesCount={post.likes_count} 
                />
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Article Content */}
              <article className="prose prose-lg max-w-none">
                <BlogContent content={post.content || ''} />
                
                {/* Sources Section */}
                {post.sources && post.sources.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <h3 className="text-xl font-semibold mb-4">Sources</h3>
                    <ul className="space-y-2">
                      {post.sources.map((source: { label: string; url: string }, index: number) => (
                        <li key={index}>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline"
                          >
                            {source.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>

              {/* Article Footer Actions */}
              <div className="flex items-center justify-center py-8 border-t">
                <BlogLikeButton 
                  postId={post.id} 
                  initialLikesCount={post.likes_count}
                  className="text-base px-6 py-3"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Table of Contents */}
              {post.content && (
                <BlogTableOfContents content={post.content} />
              )}

              {/* Share Card */}
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="font-semibold">Enjoying this post?</h3>
                  <p className="text-sm text-muted-foreground">
                    Share it with your football community!
                  </p>
                  <Button onClick={handleShare} className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Post
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-16 border-t">
              <h2 className="text-2xl font-bold mb-8 text-center">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}