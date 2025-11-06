'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { TitleDialog } from './TitleDialog';
import BottomSheetContainer from '@/components/ui/BottomSheetContainer';
import { useToast } from '@/hooks/use-toast';

interface SaveButtonProps {
  fileName: string;
  editedText: string;
  editedMarkdown: string;
  onSave: () => void;
  isEditMode?: boolean;
  isDisabled?: boolean;
  id?: string;
}

interface SavedItem {
  title: string;
  fileName: string;
  editedText: string;
  editedMarkdown: string;
  createdAt: string;
  updatedAt?: string;
}

export const createNewProject = (
  editedText: string,
  editedMarkdown: string,
  toast: ReturnType<typeof useToast>['toast'],
  onOpenDialog: () => void
) => {
  const isContentEmpty = !editedText.trim() && !editedMarkdown.trim();
  
  if (isContentEmpty) {
    toast({
      variant: 'destructive',
      title: 'Cannot save empty content',
      description: 'Please add some content before saving.',
    });
    return;
  }
  
  onOpenDialog();
};

export function SaveButton({ 
  fileName, 
  editedText, 
  editedMarkdown, 
  onSave, 
  isEditMode = false, 
  isDisabled = false,
  id
}: SaveButtonProps) {
  const [savedItems, setSavedItems] = useLocalStorage<SavedItem[]>('saved-extracts', []);
  const [isSaved, setIsSaved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const isContentEmpty = !editedText.trim() && !editedMarkdown.trim();

  const showEmptyContentToast = () => {
    toast({
      variant: 'destructive',
      title: 'Cannot save empty content',
      description: 'Please add some content before saving.',
    });
  };

  const handleUpdate = () => {
    if (isContentEmpty) {
      showEmptyContentToast();
      return;
    }
  
    const updatedItems = savedItems.map(item => 
      item.title === id ? { ...item, editedText, editedMarkdown, updatedAt: new Date().toISOString() } : item
    );
  
    setSavedItems(updatedItems);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onSave();
  };
  

  const handleSave = (title: string) => {
    if (isContentEmpty) {
      showEmptyContentToast();
      return;
    }

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
      const newItem: SavedItem = { 
        title, 
        fileName, 
        editedText, 
        editedMarkdown, 
        createdAt: new Date().toISOString() 
      };
      setSavedItems([...savedItems, newItem]);
    }
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onSave();
  };

  const handleNewProjectClick = () => {
    setIsSheetOpen(false);
    setIsDialogOpen(true);
  };

  const handleMergeIntoProject = (title: string) => {
    handleSave(title);
    setIsSheetOpen(false);
  };

  const handleSaveButtonClick = () => {
    if (isEditMode) {
      handleUpdate();
    } else {
      if (isContentEmpty) {
        showEmptyContentToast();
        return;
      }
      setIsSheetOpen(true);
    }
  };

  const getSaveButtonLabel = () => {
    if (isSaved) {
      return isEditMode ? 'Updated!' : 'Saved!';
    }
    return isEditMode ? 'Update' : 'Save';
  };

  return (
    <>
      <Button
        disabled={isSaved || isContentEmpty || isDisabled}
        onClick={handleSaveButtonClick}
      >
        {getSaveButtonLabel()}
      </Button>

      {isSheetOpen && (
        <BottomSheetContainer
          onClose={() => setIsSheetOpen(false)}
          title={isEditMode ? 'Update Project' : 'Save Project'}
        >
          <div className="flex flex-col gap-4">
          
            <Button
              variant="default"
              className="w-full"
              onClick={handleNewProjectClick}
            >
              Create New Project
            </Button>

            {savedItems.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm text-center text-muted-foreground px-1">
                  Merge into existing project
                </h3>
                <div className="flex flex-col">
                  {savedItems.map((item) => (
                    <Button
                      key={item.title}
                      variant="ghost"
                      className="w-full justify-start h-9"
                      onClick={() => handleMergeIntoProject(item.title)}
                    >
                      {item.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BottomSheetContainer>
      )}

      <TitleDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        savedItems={savedItems}
      />
    </>
  );
}