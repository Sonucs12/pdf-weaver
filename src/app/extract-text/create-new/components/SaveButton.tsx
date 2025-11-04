'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { TitleDialog } from './TitleDialog';

interface SaveButtonProps {
  fileName: string;
  editedText: string;
  editedMarkdown: string;
}

export function SaveButton({ fileName, editedText, editedMarkdown }: SaveButtonProps) {
  const [savedItems, setSavedItems] = useLocalStorage<any[]>('saved-extracts', []);
  const [isSaved, setIsSaved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (title: string) => {
    const existingIndex = savedItems.findIndex(item => item.title === title);
    const newItem = { title, fileName, editedText, editedMarkdown, savedAt: new Date().toISOString() };

    if (existingIndex > -1) {
      const updatedItems = [...savedItems];
      updatedItems[existingIndex] = newItem;
      setSavedItems(updatedItems);
    } else {
      setSavedItems([...savedItems, newItem]);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} disabled={isSaved}>
        {isSaved ? 'Saved!' : 'Save'}
      </Button>
      <TitleDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
