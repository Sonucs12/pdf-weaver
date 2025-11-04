'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { TitleDialog } from './TitleDialog';
import { DropDownMenu } from '@/components/ui/dropdown-menu';

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

    if (existingIndex > -1) {
      const updatedItems = [...savedItems];
      const existingItem = updatedItems[existingIndex];
      existingItem.editedText += `\n\n${editedText}`;
      existingItem.editedMarkdown += `\n\n${editedMarkdown}`;
      existingItem.updatedAt = new Date().toISOString();
      updatedItems[existingIndex] = existingItem;
      setSavedItems(updatedItems);
    } else {
      const newItem = { title, fileName, editedText, editedMarkdown, createdAt: new Date().toISOString() };
      setSavedItems([...savedItems, newItem]);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const menuItems = [
    {
      label: 'New Project',
      onClick: () => setIsDialogOpen(true),
    },
    {
      label: 'Merge into existing project',
      disabled: true,
    },
    ...savedItems.map(item => ({
      label: item.title,
      onClick: () => handleSave(item.title),
    })),
  ];

  return (
    <>
      <DropDownMenu
        trigger={<Button disabled={isSaved}>{isSaved ? 'Saved!' : 'Save'}</Button>}
        items={menuItems}
      />
      <TitleDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
