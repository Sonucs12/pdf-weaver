'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SaveButtonProps {
  fileName: string;
  editedText: string;
  editedMarkdown: string;
}

export function SaveButton({ fileName, editedText, editedMarkdown }: SaveButtonProps) {
  const [savedItems, setSavedItems] = useLocalStorage<any[]>('saved-extracts', []);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const existingIndex = savedItems.findIndex(item => item.fileName === fileName);
    const newItem = { fileName, editedText, editedMarkdown, savedAt: new Date().toISOString() };

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
    <Button onClick={handleSave} disabled={isSaved}>
      <Save className="mr-2 h-4 w-4" />
      {isSaved ? 'Saved!' : 'Save'}
    </Button>
  );
}
