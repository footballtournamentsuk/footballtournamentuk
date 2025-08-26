import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Tag,
  Search,
  Palette
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface BlogTagsManagerProps {
  tags: BlogTag[];
  onTagsChange: () => void;
}

export const BlogTagsManager: React.FC<BlogTagsManagerProps> = ({ 
  tags, 
  onTagsChange 
}) => {
  const { toast } = useToast();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({ name: '', slug: '', color: '#6366F1' });
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createTag = async () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_tags')
        .insert([{
          name: newTag.name,
          slug: newTag.slug || generateSlug(newTag.name),
          color: newTag.color
        }]);

      if (error) throw error;

      toast({
        title: "Tag Created",
        description: `Tag "${newTag.name}" has been created successfully`,
      });

      setNewTag({ name: '', slug: '', color: '#6366F1' });
      setShowNewTagForm(false);
      onTagsChange();
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate key') 
          ? "A tag with this slug already exists" 
          : "Failed to create tag",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateTag = async (id: string, updatedData: Partial<BlogTag>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_tags')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Tag Updated",
        description: "Tag has been updated successfully",
      });

      setEditingTag(null);
      onTagsChange();
    } catch (error: any) {
      console.error('Error updating tag:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate key') 
          ? "A tag with this slug already exists" 
          : "Failed to update tag",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTag = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Tag Deleted",
        description: `Tag "${name}" has been deleted successfully`,
      });

      onTagsChange();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  const TagEditor: React.FC<{ tag: BlogTag }> = ({ tag }) => {
    const [editData, setEditData] = useState({
      name: tag.name,
      slug: tag.slug,
      color: tag.color
    });

    return (
      <div className="space-y-3 p-4 border rounded-md bg-muted/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`name-${tag.id}`}>Name</Label>
            <Input
              id={`name-${tag.id}`}
              value={editData.name}
              onChange={(e) => setEditData(prev => ({
                ...prev,
                name: e.target.value,
                slug: generateSlug(e.target.value)
              }))}
              placeholder="Tag name"
            />
          </div>
          <div>
            <Label htmlFor={`slug-${tag.id}`}>Slug</Label>
            <Input
              id={`slug-${tag.id}`}
              value={editData.slug}
              onChange={(e) => setEditData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="tag-slug"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label htmlFor={`color-${tag.id}`}>Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`color-${tag.id}`}
                type="color"
                value={editData.color}
                onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                className="w-16 h-10"
              />
              <Badge style={{ backgroundColor: editData.color, color: 'white' }}>
                {editData.name}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => updateTag(tag.id, editData)}
            disabled={saving}
            className="gap-1"
          >
            <Save className="h-3 w-3" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingTag(null)}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tags Management</h2>
          <p className="text-muted-foreground">Manage your blog taxonomy and categorization</p>
        </div>
        <Button 
          onClick={() => setShowNewTagForm(true)}
          disabled={showNewTagForm}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Tag
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* New Tag Form */}
      {showNewTagForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Tag
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-name">Name *</Label>
                <Input
                  id="new-name"
                  value={newTag.name}
                  onChange={(e) => setNewTag(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  }))}
                  placeholder="Tag name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-slug">Slug</Label>
                <Input
                  id="new-slug"
                  value={newTag.slug}
                  onChange={(e) => setNewTag(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated-slug"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="new-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="new-color"
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Badge style={{ backgroundColor: newTag.color, color: 'white' }}>
                    {newTag.name || 'Preview'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createTag}
                disabled={saving || !newTag.name.trim()}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Creating...' : 'Create Tag'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewTagForm(false);
                  setNewTag({ name: '', slug: '', color: '#6366F1' });
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags List */}
      <div className="space-y-4">
        {filteredTags.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tags found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search term.' 
                  : 'Get started by creating your first tag.'}
              </p>
              {!searchTerm && !showNewTagForm && (
                <Button onClick={() => setShowNewTagForm(true)}>
                  Create First Tag
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="p-6">
                {editingTag === tag.id ? (
                  <TagEditor tag={tag} />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge 
                        style={{ backgroundColor: tag.color, color: 'white' }}
                        className="text-sm px-3 py-1"
                      >
                        {tag.name}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-mono">{tag.slug}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(tag.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTag(tag.id)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTag(tag.id, tag.name)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredTags.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredTags.length} of {tags.length} tags
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  {new Set(tags.map(t => t.color)).size} unique colors
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};