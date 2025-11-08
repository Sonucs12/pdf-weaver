'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { WyngEditor } from '@/app/extract-text/components/WyngEditor';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/BackButton';
import { Save, Loader2 } from 'lucide-react';
import { ExportMenu } from '@/app/extract-text/create-new/components/ExportMenu';
import { markdownToHtml } from '@/hooks/use-markdown-to-html';
import { MarkdownPreviewDialog } from '@/app/extract-text/components/MarkdownPreviewDialog';
import { useToast } from '@/hooks/use-toast';

interface SavedItem {
  id: string;
  title: string;
  fileName: string;
  editedText: string;
  editedMarkdown: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditSavedPage() {
  const router = useRouter();
  const params = useParams();
  const { title } = params;
  const [savedItems, setSavedItems] = useLocalStorage<Record<string, SavedItem>>('saved-extracts', {});
  const [item, setItem] = useState<SavedItem | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [hasChanged, setHasChanged] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const decodedTitle = decodeURIComponent(title as string);
    const foundItem = Object.values(savedItems).find(item => item.title === decodedTitle);
    if (foundItem) {
      setItem(foundItem);
      setEditedMarkdown(foundItem.editedMarkdown || '');
      setEditedText(foundItem.editedText || markdownToHtml(foundItem.editedMarkdown || ''));
    } else {
      // Handle item not found, maybe redirect or show an error
      router.push('/extract-text/saved');
    }
  }, [title, savedItems, router]);

  useEffect(() => {
    if (item) {
      const isMarkdownChanged = item.editedMarkdown !== editedMarkdown;
      const isTextChanged = item.editedText !== editedText;
      setHasChanged(isMarkdownChanged || isTextChanged);
    }
  }, [editedMarkdown, editedText, item]);

  const handleUpdate = () => {
    if (item && hasChanged) {
      setIsUpdating(true);
      const updatedItem: SavedItem = { ...item, editedText, editedMarkdown, updatedAt: new Date().toISOString() };
      // Update directly using object spread
      setSavedItems({
        ...savedItems,
        [item.id]: updatedItem
      });
      setIsUpdating(false);
      router.push('/extract-text/saved');
    } else {
      toast({
        title: 'No changes detected',
        description: 'The content has not been modified.',
      });
    }
  };

  if (!item) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex-grow flex flex-col p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className='flex items-center justify-center flex-wrap gap-2'>
            <BackButton onClick={() => router.push('/extract-text/saved')} />
          {/* <h1 className="text-lg font-medium">Edit: {item.fileName}</h1> */}
          </div>
          <div className="flex gap-2">
            <MarkdownPreviewDialog markdown={editedMarkdown} title={`Preview: ${item.fileName}`} triggerLabel="Preview" size="lg" />
            <Button onClick={handleUpdate} disabled={!hasChanged} loading={isUpdating}>
              Update
            </Button>
            <ExportMenu editedText={editedText} editedMarkdown={item.editedMarkdown} fileName={item.fileName} isProcessing={false} projectTitle={item.title} />
           
          </div>
        </div>
        <WyngEditor
          markdown={editedMarkdown}
          onChange={setEditedMarkdown}
          placeholder="Edit your content..."
        />
      </div>
    </div>
  );
}
