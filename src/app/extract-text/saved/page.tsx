'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SavedExtractCard } from './components/SavedExtractCard';
import { Save } from 'lucide-react';

interface SavedItem {
  title: string;
  fileName: string;
  editedText: string;
  editedMarkdown: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SavedPage() {
  const [savedItems, setSavedItems] = useLocalStorage<SavedItem[]>('saved-extracts', []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = (title: string) => {
    const updatedItems = savedItems.filter(item => item.title !== title);
    setSavedItems(updatedItems);
  };

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex-grow flex flex-col p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Save className="h-8 w-8" />
            Saved Documents
          </h1>
          <p className="text-muted-foreground">Your saved and downloaded documents</p>
        </div>

        {savedItems.length === 0 ? (
          <p>No saved documents yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedItems.map((item) => (
              <SavedExtractCard
                key={item.title}
                title={item.title}
                fileName={item.fileName}
                createdAt={item.createdAt}
                updatedAt={item.updatedAt}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
