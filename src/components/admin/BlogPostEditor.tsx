import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Eye, 
  Calendar, 
  Send, 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Clock,
  Link2,
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// import { DateTimePicker } from '@/components/ui/date-time-picker';

interface BlogPostEditorProps {
  postId?: string;
  tags: Array<{ id: string; name: string; slug: string; color: string }>;
  onSave: () => void;
  onCancel: () => void;
}

interface PostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_alt: string;
  og_image_url: string;
  canonical_url: string;
  tags: string[];
  status: string;
  published_at: Date | null;
  is_pinned: boolean;
  sources: Array<{ label: string; url: string }>;
}

export const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ 
  postId, 
  tags, 
  onSave, 
  onCancel 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    cover_alt: '',
    og_image_url: '',
    canonical_url: '',
    tags: [],
    status: 'draft',
    published_at: null,
    is_pinned: false,
    sources: []
  });

  const [newTag, setNewTag] = useState({ name: '', slug: '', color: '#6366F1' });
  const [showNewTagForm, setShowNewTagForm] = useState(false);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!unsavedChanges || !postData.title.trim()) return;
    
    try {
      await savePost(true);
      setLastSaved(new Date());
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [postData, unsavedChanges]);

  // Auto-save every 5 seconds when there are unsaved changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (unsavedChanges) {
        autoSave();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoSave, unsavedChanges]);

  // Load existing post if editing
  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = postData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.ceil(words / 200))); // 200 words per minute
  }, [postData.content]);

  // Generate slug from title
  useEffect(() => {
    if (postData.title && (!postId || postData.status === 'draft')) {
      const slug = generateSlug(postData.title);
      setPostData(prev => ({ ...prev, slug }));
    }
  }, [postData.title, postId]);

  // Auto-fill canonical URL and OG image
  useEffect(() => {
    if (postData.slug && !postData.canonical_url) {
      setPostData(prev => ({
        ...prev,
        canonical_url: `https://footballtournamentsuk.co.uk/blog/${prev.slug}`
      }));
    }
    if (postData.cover_image_url && !postData.og_image_url) {
      setPostData(prev => ({ ...prev, og_image_url: prev.cover_image_url }));
    }
  }, [postData.slug, postData.cover_image_url]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId as any)
        .single();

      if (error) throw error;

      const postData = data as any;
      setPostData({
        title: postData.title || '',
        slug: postData.slug || '',
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        cover_image_url: postData.cover_image_url || '',
        cover_alt: postData.cover_alt || '',
        og_image_url: postData.og_image_url || '',
        canonical_url: postData.canonical_url || '',
        tags: postData.tags || [],
        status: postData.status || 'draft',
        published_at: postData.published_at ? new Date(postData.published_at) : null,
        is_pinned: postData.is_pinned || false,
        sources: Array.isArray(postData.sources) ? postData.sources.map((s: any) => ({
          label: s.label || '',
          url: s.url || ''
        })) : []
      });
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (isAutoSave = false) => {
    if (!isAutoSave) setSaving(true);

    try {
      const saveData = {
        ...postData,
        author_id: (await supabase.auth.getUser()).data.user?.id,
        reading_time: readingTime,
        published_at: postData.status === 'published' && postData.published_at 
          ? postData.published_at.toISOString()
          : postData.status === 'published' 
          ? new Date().toISOString()
          : null
      };

      if (postId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(saveData as any)
          .eq('id', postId as any);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([saveData] as any)
          .select()
          .single();
        if (error) throw error;
        navigate(`/admin/ecosystem/blog/posts/edit/${(data as any).id}`, { replace: true });
      }

      if (!isAutoSave) {
        toast({
          title: "Post Saved",
          description: postData.status === 'published' ? "Post has been published" : "Draft saved successfully",
        });
        setUnsavedChanges(false);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  const handlePublish = async () => {
    const updatedData = {
      ...postData,
      status: 'published',
      published_at: new Date()
    };
    setPostData(updatedData);
    await savePost();
    onSave();
  };

  const handleSchedule = async () => {
    if (!postData.published_at) {
      toast({
        title: "Error",
        description: "Please select a publish date",
        variant: "destructive",
      });
      return;
    }

    const updatedData = {
      ...postData,
      status: 'published'
    };
    setPostData(updatedData);
    await savePost();
    onSave();
  };

  const updateField = (field: keyof PostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const addSource = () => {
    setPostData(prev => ({
      ...prev,
      sources: [...prev.sources, { label: '', url: '' }]
    }));
    setUnsavedChanges(true);
  };

  const updateSource = (index: number, field: 'label' | 'url', value: string) => {
    setPostData(prev => ({
      ...prev,
      sources: prev.sources.map((source, i) => 
        i === index ? { ...source, [field]: value } : source
      )
    }));
    setUnsavedChanges(true);
  };

  const removeSource = (index: number) => {
    setPostData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
    setUnsavedChanges(true);
  };

  const createNewTag = async () => {
    if (!newTag.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .insert([{
          name: newTag.name,
          slug: newTag.slug || generateSlug(newTag.name),
          color: newTag.color
        }] as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tag Created",
        description: `Tag "${newTag.name}" has been created`,
      });

      // Add the new tag to the post and reset form
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, (data as any).slug]
      }));
      setNewTag({ name: '', slug: '', color: '#6366F1' });
      setShowNewTagForm(false);
      setUnsavedChanges(true);
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const toggleTag = (tagSlug: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagSlug)
        ? prev.tags.filter(t => t !== tagSlug)
        : [...prev.tags, tagSlug]
    }));
    setUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onCancel} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {postId ? 'Edit Post' : 'Create New Post'}
              </h1>
              {lastSaved && (
                <p className="text-sm text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              onClick={() => savePost()}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={postData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter post title..."
                    className="text-lg font-semibold"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={postData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="auto-generated-slug"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={postData.excerpt}
                    onChange={(e) => updateField('excerpt', e.target.value)}
                    placeholder="Brief description of the post..."
                    rows={3}
                  />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="content">Content *</Label>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readingTime} min read
                      </span>
                      <span>{wordCount} words</span>
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    value={postData.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    placeholder="Write your post content in Markdown..."
                    rows={20}
                    className="font-mono"
                    required
                  />
                </div>

                {/* Sources */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Sources</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSource}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Source
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {postData.sources.map((source, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Source label"
                          value={source.label}
                          onChange={(e) => updateSource(index, 'label', e.target.value)}
                        />
                        <Input
                          placeholder="Source URL"
                          value={source.url}
                          onChange={(e) => updateSource(index, 'url', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSource(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="status">Status</Label>
                  <Badge variant={postData.status === 'published' ? 'default' : 'secondary'}>
                    {postData.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pinned">Pinned</Label>
                  <Switch
                    id="pinned"
                    checked={postData.is_pinned}
                    onCheckedChange={(checked) => updateField('is_pinned', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="publish_date">Publish Date</Label>
                  <Input
                    id="publish_date"
                    type="datetime-local"
                    value={postData.published_at ? 
                      new Date(postData.published_at.getTime() - postData.published_at.getTimezoneOffset() * 60000)
                        .toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateField('published_at', e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handlePublish}
                    disabled={saving}
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Publish Now
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    disabled={saving || !postData.published_at}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag.slug}
                      type="button"
                      variant={postData.tags.includes(tag.slug) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag.slug)}
                      className="text-xs"
                      style={postData.tags.includes(tag.slug) ? 
                        { backgroundColor: tag.color, borderColor: tag.color } : 
                        { borderColor: tag.color, color: tag.color }
                      }
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>

                {!showNewTagForm ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewTagForm(true)}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    New Tag
                  </Button>
                ) : (
                  <div className="space-y-2 p-3 border rounded-md">
                    <Input
                      placeholder="Tag name"
                      value={newTag.name}
                      onChange={(e) => setNewTag(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      }))}
                    />
                    <Input
                      placeholder="Slug"
                      value={newTag.slug}
                      onChange={(e) => setNewTag(prev => ({ ...prev, slug: e.target.value }))}
                    />
                    <Input
                      type="color"
                      value={newTag.color}
                      onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={createNewTag}>
                        Create
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowNewTagForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <Input
                    id="cover_image"
                    value={postData.cover_image_url}
                    onChange={(e) => updateField('cover_image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="cover_alt">Cover Alt Text *</Label>
                  <Input
                    id="cover_alt"
                    value={postData.cover_alt}
                    onChange={(e) => updateField('cover_alt', e.target.value)}
                    placeholder="Describe the cover image..."
                    required={!!postData.cover_image_url}
                  />
                </div>

                <div>
                  <Label htmlFor="og_image">OG Image URL</Label>
                  <Input
                    id="og_image"
                    value={postData.og_image_url}
                    onChange={(e) => updateField('og_image_url', e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={postData.canonical_url}
                    onChange={(e) => updateField('canonical_url', e.target.value)}
                    placeholder="https://example.com/blog/post"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};