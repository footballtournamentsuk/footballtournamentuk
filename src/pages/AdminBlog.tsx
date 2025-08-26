import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { 
  FileText, 
  Tags, 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { BlogTagsManager } from '@/components/admin/BlogTagsManager';
import { BlogMediaManager } from '@/components/admin/BlogMediaManager';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
  cover_alt?: string;
  tags: string[];
  published_at?: string;
  updated_at: string;
  status: string;
  reading_time?: number;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const AdminBlog = () => {
  const { section = 'posts', action, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Owner-only access check
  const isOwner = user?.email?.includes("owner");

  useEffect(() => {
    if (user && isOwner) {
      fetchData();
    }
  }, [user, isOwner]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPosts(), fetchTags()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load blog data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    setPosts(data || []);
  };

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name');

    if (error) throw error;
    setTags(data || []);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post Deleted",
        description: "The blog post has been deleted successfully.",
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const togglePostStatus = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const updateData: any = { status: newStatus };
    
    if (newStatus === 'published' && currentStatus === 'draft') {
      updateData.published_at = new Date().toISOString();
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: newStatus === 'published' ? "Post Published" : "Post Unpublished",
        description: newStatus === 'published' 
          ? "The post is now live on the website." 
          : "The post has been moved to drafts.",
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Access denied for non-owners
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                Only the owner can access the blog management system.
              </p>
              <Button onClick={() => navigate('/admin')}>
                Back to Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show post editor for create/edit actions
  if ((action === 'create' || action === 'edit') && section === 'posts') {
    return (
      <BlogPostEditor 
        postId={id}
        tags={tags}
        onSave={() => {
          fetchPosts();
          navigate('/admin/ecosystem/blog/posts');
        }}
        onCancel={() => navigate('/admin/ecosystem/blog/posts')}
      />
    );
  }

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, published_at?: string) => {
    if (status === 'published' && published_at && new Date(published_at) <= new Date()) {
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    } else if (status === 'published' && published_at && new Date(published_at) > new Date()) {
      return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading blog management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Blog Management</h1>
              <p className="text-muted-foreground">
                Ecosystem • Content creation and publishing
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <Tabs value={section} onValueChange={(value) => navigate(`/admin/ecosystem/blog/${value}`)}>
              <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                <TabsTrigger value="posts" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Posts ({posts.length})
                </TabsTrigger>
                <TabsTrigger value="tags" className="gap-2">
                  <Tags className="h-4 w-4" />
                  Tags ({tags.length})
                </TabsTrigger>
                <TabsTrigger value="media" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Media
                </TabsTrigger>
              </TabsList>

              {/* Posts Section */}
              <TabsContent value="posts" className="p-6 space-y-6">
                {/* Posts Header & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Drafts</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <Button 
                    onClick={() => navigate('/admin/ecosystem/blog/posts/create')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Post
                  </Button>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {filteredPosts.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filters.' 
                            : 'Get started by creating your first blog post.'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                          <Button onClick={() => navigate('/admin/ecosystem/blog/posts/create')}>
                            Create First Post
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPosts.map((post) => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold truncate">{post.title}</h3>
                                {post.is_pinned && (
                                  <Badge variant="secondary" className="text-xs">Pinned</Badge>
                                )}
                                {getStatusBadge(post.status, post.published_at)}
                              </div>
                              
                              {post.excerpt && (
                                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                  {post.excerpt}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.slice(0, 3).map((tagSlug) => {
                                  const tag = tags.find(t => t.slug === tagSlug);
                                  return tag ? (
                                    <Badge 
                                      key={tag.slug} 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ borderColor: tag.color, color: tag.color }}
                                    >
                                      {tag.name}
                                    </Badge>
                                  ) : null;
                                })}
                                {post.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{post.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {post.status === 'published' && post.published_at 
                                    ? formatDate(post.published_at)
                                    : `Updated ${formatDate(post.updated_at)}`}
                                </span>
                                {post.reading_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {post.reading_time} min read
                                  </span>
                                )}
                                <span>{post.likes_count} likes</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/ecosystem/blog/posts/edit/${post.id}`)}
                                className="gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => togglePostStatus(post.id, post.status)}
                                className="gap-1"
                              >
                                {post.status === 'published' ? (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deletePost(post.id)}
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Tags Section */}
              <TabsContent value="tags" className="p-6">
                <BlogTagsManager 
                  tags={tags} 
                  onTagsChange={fetchTags}
                />
              </TabsContent>

              {/* Media Section */}
              <TabsContent value="media" className="p-6">
                <BlogMediaManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};