import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttachmentUploaderProps {
  tournamentId: string;
  userId: string;
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  uploading: boolean;
  error?: string;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  tournamentId,
  userId,
  onUploadComplete
}) => {
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const { toast } = useToast();

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: UploadFile[] = [];

    files.forEach(file => {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not supported. Please use PDF, JPG, PNG, DOC, or DOCX files.`,
          variant: "destructive"
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit.`,
          variant: "destructive"
        });
        return;
      }

      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        uploading: false
      });
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset input
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Function to sanitize filename for Supabase Storage
  const sanitizeFilename = (filename: string) => {
    // Replace any non-ASCII characters and special characters with safe alternatives
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s.-]/g, '') // Keep only word chars, spaces, dots, and hyphens
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .toLowerCase(); // Convert to lowercase
  };

  const uploadSingleFile = async (fileToUpload: UploadFile) => {
    setSelectedFiles(prev => 
      prev.map(f => f.id === fileToUpload.id ? { ...f, uploading: true, error: undefined } : f)
    );

    try {
      const sanitizedFileName = sanitizeFilename(fileToUpload.file.name);
      const timestamp = Date.now();
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = `${userId}/${tournamentId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tournament-attachments')
        .upload(filePath, fileToUpload.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tournament-attachments')
        .getPublicUrl(uploadData.path);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('tournament_attachments')
        .insert({
          tournament_id: tournamentId,
          file_name: fileToUpload.file.name,
          file_type: fileToUpload.file.type,
          file_size: fileToUpload.file.size,
          file_url: publicUrl,
          uploaded_by: userId
        } as any);

      if (dbError) throw dbError;

      // Remove from pending uploads
      setSelectedFiles(prev => prev.filter(f => f.id !== fileToUpload.id));
      
      toast({
        title: "Upload Successful",
        description: `${fileToUpload.file.name} has been uploaded.`
      });

      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      setSelectedFiles(prev => 
        prev.map(f => f.id === fileToUpload.id ? { 
          ...f, 
          uploading: false, 
          error: error.message || 'Upload failed' 
        } : f)
      );
      
      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to upload file',
        variant: "destructive"
      });
    }
  };

  const uploadAllFiles = async () => {
    const filesToUpload = selectedFiles.filter(f => !f.uploading && !f.error);
    for (const file of filesToUpload) {
      await uploadSingleFile(file);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    return '📁';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
              Upload Attachments
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelection}
                className="flex-1"
              />
              <Button
                onClick={uploadAllFiles}
                disabled={selectedFiles.length === 0 || selectedFiles.some(f => f.uploading)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload All
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accepted formats: PDF, JPG, PNG, DOC, DOCX (max 10MB each)
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Files:</h4>
              {selectedFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFileIcon(uploadFile.file.type)}</span>
                    <div>
                      <p className="text-sm font-medium">{uploadFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadFile.error && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {uploadFile.uploading ? (
                      <div className="text-xs text-muted-foreground">Uploading...</div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => uploadSingleFile(uploadFile)}
                        disabled={!!uploadFile.error}
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.uploading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};