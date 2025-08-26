import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get latest 50 published posts with author info
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        title,
        slug,
        excerpt,
        content,
        published_at,
        updated_at,
        cover_image_url,
        profiles!blog_posts_author_id_fkey (
          full_name,
          contact_email
        )
      `)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching posts:', error)
      return new Response('Error generating feed', { status: 500 })
    }

    const baseUrl = 'https://footballtournamentsuk.co.uk'
    const feedUrl = `${baseUrl}/blog/feed.xml`
    const blogUrl = `${baseUrl}/blog`
    const now = new Date().toISOString()

    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Football Tournaments UK - Blog</title>
    <description>Latest news, insights, and updates from the UK's leading football tournament platform</description>
    <link>${blogUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <language>en-GB</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>Football Tournaments UK</generator>
    <webMaster>info@footballtournamentsuk.co.uk (Football Tournaments UK)</webMaster>
    <managingEditor>info@footballtournamentsuk.co.uk (Football Tournaments UK)</managingEditor>
    <copyright>© ${new Date().getFullYear()} Football Tournaments UK. All rights reserved.</copyright>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Football Tournaments UK</title>
      <link>${blogUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    
    ${posts?.map(post => {
      const author = post.profiles as any
      const authorName = author?.full_name || 'Football Tournaments UK'
      const postUrl = `${baseUrl}/blog/${post.slug}`
      const pubDate = new Date(post.published_at).toUTCString()
      
      // Create content with proper escaping
      let description = post.excerpt || post.content?.substring(0, 300) + '...' || ''
      if (post.cover_image_url) {
        description = `<img src="${escapeXml(post.cover_image_url)}" alt="Cover image" style="max-width: 100%; height: auto; margin-bottom: 1rem;" />${description}`
      }
      
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${description}]]></content:encoded>
      <author>${escapeXml(author?.contact_email || 'info@footballtournamentsuk.co.uk')} (${escapeXml(authorName)})</author>
      <pubDate>${pubDate}</pubDate>
      ${post.cover_image_url ? `<enclosure url="${escapeXml(post.cover_image_url)}" type="image/jpeg" />` : ''}
    </item>`
    }).join('') || ''}
  </channel>
</rss>`

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Internal server error', { status: 500 })
  }
})