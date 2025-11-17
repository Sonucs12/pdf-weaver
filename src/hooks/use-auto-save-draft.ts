"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";

interface Draft {
  id: string;
  title: string;
  fileName: string;
  lastModified: string;
  preview: string;
  editedMarkdown: string;
}

export function useAutoSaveDraft() {
  const [drafts, setDrafts] = useLocalStorage<Record<string, Draft>>(
    "pdf-write-drafts",
    {}
  );
  const { toast } = useToast();

  const draftsArray = Object.values(drafts);

  const saveDraft = (editedMarkdown: string, fileName: string) => {
    if (!editedMarkdown.trim()) {
      return;
    }

    const id = crypto.randomUUID();
    const title = `Draft - ${fileName} - ${new Date().toLocaleString()}`;

    const newDraft: Draft = {
      id,
      title,
      fileName,
      editedMarkdown,
      lastModified: new Date().toISOString(),
      preview: editedMarkdown.substring(0, 100),
    };

    // Add directly using object spread
    setDrafts({
      ...drafts,
      [id]: newDraft,
    });

    toast({
      title: "Draft saved",
      description: `Your draft "${title}" has been saved.`,
    });
  };

  return { saveDraft, drafts, draftsArray, setDrafts };
}
