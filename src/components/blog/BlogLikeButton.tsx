import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBlogLike } from '@/hooks/useBlog'
import { getOrCreateSessionId } from '@/utils/blogUtils'
import { useToast } from '@/hooks/use-toast'

interface BlogLikeButtonProps {
  postId: string
  initialLikesCount: number
  className?: string
}

export function BlogLikeButton({ postId, initialLikesCount, className }: BlogLikeButtonProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [hasLiked, setHasLiked] = useState(false)
  const { likePost, isLiking } = useBlogLike()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user has already liked this post
    const sessionId = getOrCreateSessionId()
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]')
    setHasLiked(likedPosts.includes(postId))
  }, [postId])

  const handleLike = async () => {
    if (hasLiked || isLiking) return

    try {
      const sessionId = getOrCreateSessionId()
      const result = await likePost(postId, sessionId)
      
      if (result?.success) {
        setLikesCount(result.likes_count || likesCount + 1)
        setHasLiked(true)
        
        // Store in localStorage
        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]')
        likedPosts.push(postId)
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts))
        
        if (result.message !== 'Already liked') {
          toast({
            title: "Thank you!",
            description: "Your like has been recorded.",
          })
        }
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast({
        title: "Error",
        description: "Failed to like the post. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Button
      variant={hasLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isLiking || hasLiked}
      className={`gap-2 ${className || ''}`}
    >
      <Heart 
        className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} 
      />
      <span>{likesCount}</span>
      {hasLiked && <span className="text-xs">Liked</span>}
    </Button>
  )
}