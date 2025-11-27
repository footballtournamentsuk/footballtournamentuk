import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Image, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExtractedTournament {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location_name: string;
  postcode?: string;
  region: string;
  country: string;
  type: string;
  format: string;
  age_groups: string[];
  team_types: string[];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  registration_deadline?: string;
  cost_amount?: number;
  cost_currency?: string;
  max_teams?: number;
  venue_details?: string;
  additional_notes?: string;
  latitude: number;
  longitude: number;
  is_published: boolean;
  status: string;
}

export const TournamentImageParser: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTournament | null>(null);
  const [editedData, setEditedData] = useState<ExtractedTournament | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleParseImage = async () => {
    if (!imageFile || !imagePreview) {
      toast({
        title: 'Error',
        description: 'Please select an image first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setExtractedData(null);
    setEditedData(null);

    try {
      console.log('🖼️ Parsing tournament image...');

      const { data, error } = await supabase.functions.invoke('parse-tournament-image', {
        body: { imageData: imagePreview }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to extract tournament data');
      }

      console.log('✅ Data extracted:', data.data);
      setExtractedData(data.data);
      setEditedData(data.data);

      toast({
        title: 'Success',
        description: 'Tournament data extracted! Review and save below.',
      });

    } catch (error) {
      console.error('❌ Error parsing image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to parse tournament image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTournament = async () => {
    if (!editedData) return;

    // Validate required fields
    if (!editedData.contact_email || !editedData.contact_name) {
      toast({
        title: 'Missing required fields',
        description: 'Contact name and email are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('💾 Saving tournament to database...');

      const { error } = await supabase
        .from('tournaments')
        .insert([{
          ...editedData,
          contact_email: editedData.contact_email,
          contact_name: editedData.contact_name,
          postcode: editedData.postcode || 'UNKNOWN',
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Tournament saved to moderation queue',
      });

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setExtractedData(null);
      setEditedData(null);

    } catch (error) {
      console.error('❌ Error saving tournament:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save tournament',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Extract Tournament from Image (AI-Powered)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="mb-2">
                Upload a tournament flyer, poster, or screenshot and AI will automatically extract all tournament details including dates, location, contacts, and more.
              </p>
              <p className="text-sm font-medium">
                ✓ Supports: Tournament posters, flyers, social media posts, website screenshots
              </p>
            </AlertDescription>
          </Alert>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Tournament Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleParseImage}
                disabled={loading || !imageFile}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Extract Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="border rounded-lg p-4">
              <img 
                src={imagePreview} 
                alt="Tournament preview" 
                className="max-h-96 mx-auto rounded"
              />
            </div>
          )}

          {/* Extracted Data Editor */}
          {editedData && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Extracted Tournament Data</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <Label>Tournament Name *</Label>
                    <Input
                      value={editedData.name}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editedData.description || ''}
                      onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="datetime-local"
                      value={editedData.start_date.length === 10 ? `${editedData.start_date}T00:00` : editedData.start_date.slice(0, 16)}
                      onChange={(e) => setEditedData({ ...editedData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="datetime-local"
                      value={editedData.end_date.length === 10 ? `${editedData.end_date}T00:00` : editedData.end_date.slice(0, 16)}
                      onChange={(e) => setEditedData({ ...editedData, end_date: e.target.value })}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={editedData.location_name}
                      onChange={(e) => setEditedData({ ...editedData, location_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Postcode</Label>
                    <Input
                      value={editedData.postcode || ''}
                      onChange={(e) => setEditedData({ ...editedData, postcode: e.target.value })}
                      placeholder="e.g. WN7 4JY"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Postcode helps place pin accurately on map
                    </p>
                  </div>

                  <div>
                    <Label>Region *</Label>
                    <Input
                      value={editedData.region}
                      onChange={(e) => setEditedData({ ...editedData, region: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={editedData.country}
                      onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                    />
                  </div>

                  {/* Tournament Details */}
                  <div>
                    <Label>Type *</Label>
                    <Input
                      value={editedData.type}
                      onChange={(e) => setEditedData({ ...editedData, type: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Format *</Label>
                    <Input
                      value={editedData.format}
                      onChange={(e) => setEditedData({ ...editedData, format: e.target.value })}
                    />
                  </div>

                  {/* Cost */}
                  <div>
                    <Label>Cost Amount</Label>
                    <Input
                      type="number"
                      value={editedData.cost_amount || ''}
                      onChange={(e) => setEditedData({ ...editedData, cost_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="450"
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input
                      value={editedData.cost_currency || 'GBP'}
                      onChange={(e) => setEditedData({ ...editedData, cost_currency: e.target.value })}
                      placeholder="GBP"
                    />
                  </div>

                  {/* Max Teams & Registration Deadline */}
                  <div>
                    <Label>Max Teams</Label>
                    <Input
                      type="number"
                      value={editedData.max_teams || ''}
                      onChange={(e) => setEditedData({ ...editedData, max_teams: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="32"
                    />
                  </div>
                  <div>
                    <Label>Registration Deadline</Label>
                    <Input
                      type="datetime-local"
                      value={editedData.registration_deadline ? 
                        (editedData.registration_deadline.length === 10 ? 
                          `${editedData.registration_deadline}T00:00` : 
                          editedData.registration_deadline.slice(0, 16)) : ''}
                      onChange={(e) => setEditedData({ ...editedData, registration_deadline: e.target.value || undefined })}
                    />
                  </div>

                  {/* Contact Info */}
                  <div>
                    <Label>Contact Name *</Label>
                    <Input
                      value={editedData.contact_name || ''}
                      onChange={(e) => setEditedData({ ...editedData, contact_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Contact Email *</Label>
                    <Input
                      type="email"
                      value={editedData.contact_email || ''}
                      onChange={(e) => setEditedData({ ...editedData, contact_email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Contact Phone</Label>
                    <Input
                      value={editedData.contact_phone || ''}
                      onChange={(e) => setEditedData({ ...editedData, contact_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      type="url"
                      value={editedData.website || ''}
                      onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                    />
                  </div>

                  {/* Age Groups and Team Types */}
                  <div className="col-span-2">
                    <Label>Age Groups</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editedData.age_groups.map((ag, idx) => (
                        <Badge key={idx} variant="secondary">{ag}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Team Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editedData.team_types.map((tt, idx) => (
                        <Badge key={idx} variant="secondary">{tt}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Coordinates Display */}
                  <div className="col-span-2 bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-100">Map Location</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Latitude:</span>
                        <span className="ml-2 font-mono">{editedData.latitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Longitude:</span>
                        <span className="ml-2 font-mono">{editedData.longitude.toFixed(6)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      ℹ️ Tournament pin will be placed at these coordinates
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleSaveTournament}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save to Moderation Queue'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="text-sm font-medium mb-2 text-blue-900">Tips for Best Results:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use clear, high-resolution images</li>
              <li>• Ensure all text is legible</li>
              <li>• Tournament posters and flyers work best</li>
              <li>• AI extracts contact details automatically</li>
              <li>• Review and edit extracted data before saving</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
