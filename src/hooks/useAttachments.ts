import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Attachment {
  id: string;
  tournament_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export const useAttachments = (tournamentId: string) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tournament_attachments')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching attachments:', fetchError);
        setError(fetchError.message);
        return;
      }

      setAttachments(data || []);
    } catch (err: any) {
      console.error('Error in fetchAttachments:', err);
      setError(err.message || 'Failed to fetch attachments');
    } finally {
      setLoading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('tournament-attachments')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('tournament_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        throw dbError;
      }

      // Refresh attachments
      await fetchAttachments();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchAttachments();
    }
  }, [tournamentId]);

  return {
    attachments,
    loading,
    error,
    refetch: fetchAttachments,
    deleteAttachment
  };
};