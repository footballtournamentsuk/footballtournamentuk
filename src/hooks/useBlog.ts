import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { BlogPost, BlogListingParams, BlogPagination } from '@/types/blog'

const POSTS_PER_PAGE = 12

export function useBlogPosts(params: BlogListingParams = {}) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [pagination, setPagination] = useState<BlogPagination>({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { page = 1, tag, search, limit = POSTS_PER_PAGE } = params

  useEffect(() => {
    fetchPosts()
  }, [page, tag, search, limit])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey (
            full_name,
            contact_email
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())

      // Apply filters
      if (tag) {
        query = query.contains('tags', [tag])
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error: fetchError, count } = await query
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .range(from, to)

      if (fetchError) throw fetchError

      const processedPosts = (data || []).map(post => ({
        ...post,
        sources: Array.isArray(post.sources) ? post.sources : []
      })) as BlogPost[]

      setPosts(processedPosts)
      
      const totalPosts = count || 0
      const totalPages = Math.ceil(totalPosts / limit)
      
      setPagination({
        currentPage: page,
        totalPages,
        totalPosts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      })

    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  return {
    posts,
    pagination,
    loading,
    error,
    refetch: fetchPosts
  }
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey (
            full_name,
            contact_email
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .single()

      if (fetchError) throw fetchError
      
      const processedPost = {
        ...data,
        sources: Array.isArray(data.sources) ? data.sources : []
      } as BlogPost
      
      setPost(processedPost)

    } catch (err) {
      console.error('Error fetching blog post:', err)
      setError('Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  return {
    post,
    loading,
    error,
    refetch: fetchPost
  }
}

export function useBlogTags() {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())

      if (error) throw error

      const allTags = new Set<string>()
      data?.forEach(post => {
        post.tags?.forEach(tag => allTags.add(tag))
      })

      setTags(Array.from(allTags).sort())
    } catch (err) {
      console.error('Error fetching tags:', err)
    } finally {
      setLoading(false)
    }
  }

  return { tags, loading }
}

export function useBlogLike() {
  const [isLiking, setIsLiking] = useState(false)

  const likePost = async (postId: string, sessionId: string) => {
    if (isLiking) return null

    try {
      setIsLiking(true)

      const response = await supabase.functions.invoke('blog-like', {
        body: { postId, sessionId }
      })

      if (response.error) throw response.error
      return response.data

    } catch (error) {
      console.error('Error liking post:', error)
      throw error
    } finally {
      setIsLiking(false)
    }
  }

  return { likePost, isLiking }
}