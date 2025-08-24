import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareCoverUploadProps {
  tournamentId: string;
  currentShareCoverUrl?: string;
  currentAltText?: string;
  currentVariant?: string;
  onUploadComplete: (url: string, altText: string, variant: string) => void;
}

export const ShareCoverUpload: React.FC<ShareCoverUploadProps> = ({
  tournamentId,
  currentShareCoverUrl,
  currentAltText = '',
  currentVariant = 'FB_1200x630',
  onUploadComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentShareCoverUrl || null);
  const [altText, setAltText] = useState(currentAltText);
  const [variant, setVariant] = useState(currentVariant);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getMinDimensions = (selectedVariant: string) => {
    switch (selectedVariant) {
      case 'IG_1080x1350':
        return { width: 1080, height: 1350, name: 'Instagram Portrait' };
      case 'IG_1080x1080':
        return { width: 1080, height: 1080, name: 'Instagram Square' };
      case 'FB_1200x630':
      default:
        return { width: 1200, height: 630, name: 'Facebook/Twitter' };
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const minDims = getMinDimensions(variant);
        const isValidSize = img.width >= minDims.width && img.height >= minDims.height;
        
        if (!isValidSize) {
          setValidationError(
            `Image must be at least ${minDims.width}×${minDims.height}px for ${minDims.name} format. Current size: ${img.width}×${img.height}px`
          );
          resolve(false);
        } else {
          setValidationError(null);
          resolve(true);
        }
        
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        setValidationError('Invalid image file');
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setValidationError('File size must be less than 2MB');
      return;
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationError('Only JPG, PNG, and WebP files are allowed');
      return;
    }

    // Validate image dimensions
    const isValid = await validateImage(file);
    if (!isValid) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Start upload
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${tournamentId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('share-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('share-covers')
        .getPublicUrl(filePath);

      onUploadComplete(data.publicUrl, altText, variant);
      
      toast({
        title: 'Success',
        description: 'Share cover uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload share cover. Please try again.',
        variant: 'destructive'
      });
      setPreviewUrl(currentShareCoverUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setAltText('');
    onUploadComplete('', '', variant);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectRatioClass = () => {
    switch (variant) {
      case 'IG_1080x1350':
        return 'aspect-[4/5]';
      case 'IG_1080x1080':
        return 'aspect-square';
      case 'FB_1200x630':
      default:
        return 'aspect-[1200/630]';
    }
  };

  const minDims = getMinDimensions(variant);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Cover (Full-size)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Variant Selection */}
        <div className="space-y-2">
          <Label>Format</Label>
          <ToggleGroup 
            type="single" 
            value={variant} 
            onValueChange={(value) => value && setVariant(value)}
            className="justify-start"
          >
            <ToggleGroupItem value="FB_1200x630" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              Facebook/Twitter
            </ToggleGroupItem>
            <ToggleGroupItem value="IG_1080x1350" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              Instagram Portrait
            </ToggleGroupItem>
            <ToggleGroupItem value="IG_1080x1080" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              Instagram Square
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-sm text-muted-foreground">
            Minimum size: {minDims.width}×{minDims.height}px
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="share-cover">Upload Image</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              id="share-cover"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="flex-1"
            />
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            JPG, PNG, or WebP. Max 2MB.
          </p>
        </div>

        {/* Validation Error */}
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Alt Text */}
        <div className="space-y-2">
          <Label htmlFor="alt-text">Alt Text</Label>
          <Input
            id="alt-text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the image for accessibility"
            disabled={isUploading}
          />
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className={`relative ${getAspectRatioClass()} max-w-md mx-auto bg-muted rounded-lg overflow-hidden`}>
              <img
                src={previewUrl}
                alt={altText || 'Share cover preview'}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white font-medium">Uploading...</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};