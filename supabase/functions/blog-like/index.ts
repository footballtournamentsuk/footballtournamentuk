import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting cache (in production, use Redis)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(sessionId: string): boolean {
  const now = Date.now()
  const key = sessionId
  const limit = rateLimitCache.get(key)
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new limit (1 like per minute)
    rateLimitCache.set(key, { count: 1, resetTime: now + 60000 })
    return false
  }
  
  if (limit.count >= 1) {
    return true
  }
  
  limit.count++
  return false
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { postId, sessionId } = await req.json()

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required for anonymous likes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check rate limit
    if (isRateLimited(sessionId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before liking again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Check if post exists and is published
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('id, status, published_at')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (post.status !== 'published' || !post.published_at || new Date(post.published_at) > new Date()) {
      return new Response(
        JSON.stringify({ error: 'Post is not published' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Try to insert the like (idempotent due to unique constraint)
    const { error: likeError } = await supabase
      .from('blog_post_likes')
      .insert({ 
        post_id: postId, 
        session_id: sessionId
      })

    if (likeError) {
      // If it's a duplicate, that's fine (already liked)
      if (likeError.code === '23505') {
        return new Response(
          JSON.stringify({ success: true, message: 'Already liked' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.error('Error inserting like:', likeError)
      return new Response(
        JSON.stringify({ error: 'Failed to add like' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get updated likes count
    const { data: updatedPost, error: countError } = await supabase
      .from('blog_posts')
      .select('likes_count')
      .eq('id', postId)
      .single()

    if (countError) {
      console.error('Error getting updated count:', countError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        likes_count: updatedPost?.likes_count || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in blog-like function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})