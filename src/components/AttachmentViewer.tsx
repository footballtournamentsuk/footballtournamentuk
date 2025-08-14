import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, X, File } from 'lucide-react';

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

interface AttachmentViewerProps {
  attachments: Attachment[];
}

export const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ attachments }) => {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  if (attachments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No attachments available for this tournament.</p>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (fileType: string) => {
    return fileType.startsWith('image/') || 
           fileType === 'application/pdf' || 
           fileType.includes('word');
  };

  const renderPreview = (attachment: Attachment) => {
    const { file_type, file_url, file_name } = attachment;

    if (file_type.startsWith('image/')) {
      return (
        <div className="max-w-full max-h-96 overflow-auto">
          <img 
            src={file_url} 
            alt={file_name}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      );
    }

    if (file_type === 'application/pdf') {
      return (
        <div className="w-full h-96">
          <iframe
            src={file_url}
            className="w-full h-full border rounded-lg"
            title={file_name}
          />
        </div>
      );
    }

    if (file_type.includes('word')) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file_url)}`;
      return (
        <div className="w-full h-96">
          <iframe
            src={officeViewerUrl}
            className="w-full h-full border rounded-lg"
            title={file_name}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
        <div className="text-center">
          <File className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Preview not available</p>
          <p className="text-xs text-muted-foreground">Click download to view file</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getFileIcon(attachment.file_type)}</span>
                  <div>
                    <p className="text-sm font-medium">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file_size)} • {' '}
                      {new Date(attachment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {canPreview(attachment.file_type) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAttachment(attachment)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = attachment.file_url;
                      link.download = attachment.file_name;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAttachment} onOpenChange={() => setSelectedAttachment(null)}>
        <DialogContent className="max-w-4xl max-h-screen overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedAttachment?.file_name}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttachment(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedAttachment && (
            <div className="space-y-4">
              {renderPreview(selectedAttachment)}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedAttachment.file_url;
                    link.download = selectedAttachment.file_name;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};