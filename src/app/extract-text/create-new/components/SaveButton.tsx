'use client';

import { useState, useMemo } from 'react';
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
  id: string;
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
  const [savedItems, setSavedItems] = useLocalStorage<Record<string, SavedItem>>('saved-extracts', {});
  const [isSaved, setIsSaved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  // Convert to array only for display/mapping
  const savedItemsArray = Object.values(savedItems);

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
  
    if (!id) return;
    
    // Get item by ID directly using dot operator
    const existingItem = savedItems[id];
    
    if (existingItem) {
      const updatedItem: SavedItem = {
        ...existingItem,
        editedText,
        editedMarkdown,
        updatedAt: new Date().toISOString()
      };
      // Update directly using object spread
      setSavedItems({
        ...savedItems,
        [id]: updatedItem
      });
    }
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onSave();
  };
  

  const handleSave = (title: string) => {
    if (isContentEmpty) {
      showEmptyContentToast();
      return;
    }

    // Find existing item by title
    const existingItem = Object.values(savedItems).find(item => item.title === title);

    if (existingItem) {
      // Merge into existing project
      const updatedItem: SavedItem = {
        ...existingItem,
        editedText: existingItem.editedText + `\n\n${editedText}`,
        editedMarkdown: existingItem.editedMarkdown + `\n\n${editedMarkdown}`,
        updatedAt: new Date().toISOString()
      };
      // Update directly using object spread
      setSavedItems({
        ...savedItems,
        [existingItem.id]: updatedItem
      });
    } else {
      // Create new project with unique ID
      const newId = crypto.randomUUID();
      const newItem: SavedItem = { 
        id: newId,
        title, 
        fileName, 
        editedText, 
        editedMarkdown, 
        createdAt: new Date().toISOString() 
      };
      // Add directly using object spread
      setSavedItems({
        ...savedItems,
        [newId]: newItem
      });
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

            {savedItemsArray.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm text-center text-muted-foreground px-1">
                  Merge into existing project
                </h3>
                <div className="flex flex-col">
                  {savedItemsArray.map((item) => (
                    <Button
                      key={item.id}
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
        savedItems={savedItemsArray}
      />
    </>
  );
}