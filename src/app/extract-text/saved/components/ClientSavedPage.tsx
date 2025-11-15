'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SavedExtractCard } from './SavedExtractCard';
import { Save } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';

interface SavedItem {
  id: string;
  title: string;
  fileName: string;
  editedText: string;
  editedMarkdown: string;
  pageRange: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ClientSavedPage() {
  const [savedItems, setSavedItems] = useLocalStorage<Record<string, SavedItem>>('saved-extracts', {});
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const savedItemsArray = Object.values(savedItems);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = (id: string) => {
    const { [id]: _, ...rest } = savedItems;
    setSavedItems(rest);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return savedItemsArray;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return savedItemsArray.filter(
      item =>
        item.title.toLowerCase().includes(lowerCaseQuery) ||
        item.fileName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [savedItemsArray, searchQuery]);

  if (!mounted) {
    return null; 
  }

  return (
    <div className="flex-grow flex flex-col p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="mb-4 space-y-4">
          <h1 className="text-2xl font-bold mb-2">
            Saved Documents
          </h1>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {filteredItems.length === 0 ? (
          <p>No saved documents yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <SavedExtractCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}