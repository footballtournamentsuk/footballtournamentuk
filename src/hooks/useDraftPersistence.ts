import { useState, useEffect, useCallback } from 'react';

interface DraftData {
  imagePreview: string | null;
  additionalText: string;
  extractedData: any;
  editedData: any;
  timestamp: number;
}

const DRAFT_STORAGE_KEY = 'ftuk_tournament_draft';
const DRAFT_EXPIRY_DAYS = 7; // Drafts expire after 7 days

export const useDraftPersistence = () => {
  const [hasDraft, setHasDraft] = useState(false);

  // Check if draft exists on mount
  useEffect(() => {
    const draft = getDraft();
    setHasDraft(!!draft);
  }, []);

  const saveDraft = useCallback((data: Partial<DraftData>) => {
    try {
      const existingDraft = getDraft();
      const draftData: DraftData = {
        imagePreview: null,
        additionalText: '',
        extractedData: null,
        editedData: null,
        ...existingDraft,
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setHasDraft(true);
      console.log('💾 Draft saved to localStorage');
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, []);

  const getDraft = useCallback((): DraftData | null => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!stored) return null;

      const draft: DraftData = JSON.parse(stored);
      
      // Check if draft has expired
      const daysSinceCreation = (Date.now() - draft.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > DRAFT_EXPIRY_DAYS) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return null;
      }

      return draft;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
      console.log('🗑️ Draft cleared');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  return {
    saveDraft,
    getDraft,
    clearDraft,
    hasDraft,
  };
};
