'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

interface Draft {
  id: string;
  title: string;
  fileName: string;
  lastModified: string;
  preview: string;
  editedMarkdown: string;
}

export function useAutoSaveDraft() {
  const [drafts, setDrafts] = useLocalStorage<Draft[]>('pdf-weaver-drafts', []);
  const { toast } = useToast();

  const saveDraft = (editedMarkdown: string, fileName: string) => {
    if (!editedMarkdown.trim()) {
      return;
    }

    const title = `Draft - ${fileName} - ${new Date().toLocaleString()}`;

    const newDraft: Draft = {
      id: crypto.randomUUID(),
      title,
      fileName,
      editedMarkdown,
      lastModified: new Date().toISOString(),
      preview: editedMarkdown.substring(0, 100),
    };

    setDrafts([...drafts, newDraft]);

    toast({
      title: 'Draft saved',
      description: `Your draft "${title}" has been saved.`,
    });
  };

  return { saveDraft };
}