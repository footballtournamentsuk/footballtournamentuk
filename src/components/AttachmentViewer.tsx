import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, X, FileText, Image as ImageIcon } from 'lucide-react';

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
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-green-500" />;
    }
    if (fileType === 'application/pdf') {
      return <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">PDF</div>;
    }
    if (fileType.includes('word')) {
      return <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">DOC</div>;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
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
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-32 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="text-center space-y-2">
          <FileText className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">Preview not available</p>
          <p className="text-xs text-muted-foreground/75">Click download to view file</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(attachment.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={attachment.file_name}>
                    {attachment.file_name}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                    <span className="bg-muted/50 px-2 py-0.5 rounded">
                      {formatFileSize(attachment.file_size)}
                    </span>
                    <span className="bg-muted/50 px-2 py-0.5 rounded">
                      {new Date(attachment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {canPreview(attachment.file_type) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAttachment(attachment)}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors w-full sm:w-auto"
                    aria-label={`Preview ${attachment.file_name}`}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
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
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-colors w-full sm:w-auto"
                  aria-label={`Download ${attachment.file_name}`}
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAttachment} onOpenChange={() => setSelectedAttachment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                {selectedAttachment && getFileIcon(selectedAttachment.file_type)}
                <span className="truncate">{selectedAttachment?.file_name}</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttachment(null)}
                className="shrink-0"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {selectedAttachment && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-1 rounded">
                  {formatFileSize(selectedAttachment.file_size)}
                </span>
                <span className="bg-muted px-2 py-1 rounded">
                  {new Date(selectedAttachment.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </DialogHeader>
          {selectedAttachment && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                {renderPreview(selectedAttachment)}
              </div>
              
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedAttachment.file_url;
                    link.download = selectedAttachment.file_name;
                    link.click();
                  }}
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                  aria-label={`Download ${selectedAttachment.file_name}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};