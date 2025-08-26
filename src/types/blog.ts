export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  cover_image_url?: string
  cover_alt?: string
  author_id?: string
  tags: string[]
  published_at?: string
  updated_at: string
  status: string
  reading_time?: number
  og_image_url?: string
  canonical_url?: string
  likes_count: number
  is_pinned: boolean
  created_at: string
  profiles?: {
    full_name?: string
    contact_email: string
  }
}

export interface BlogPostLike {
  id: string
  post_id: string
  session_id?: string
  user_id?: string
  created_at: string
}

export interface BlogListingParams {
  page?: number
  tag?: string
  search?: string
  limit?: number
}

export interface BlogPagination {
  currentPage: number
  totalPages: number
  totalPosts: number
  hasNext: boolean
  hasPrev: boolean
}