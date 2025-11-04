'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { WyngEditor } from '@/app/extract-text/components/WyngEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { ExportMenu } from '@/app/extract-text/create-new/components/ExportMenu';
import { markdownToHtml } from '@/hooks/use-markdown-to-html';
import { MarkdownPreviewDialog } from '@/app/extract-text/components/MarkdownPreviewDialog';

interface SavedItem {
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
  const [savedItems, setSavedItems] = useLocalStorage<SavedItem[]>('saved-extracts', []);
  const [item, setItem] = useState<SavedItem | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedMarkdown, setEditedMarkdown] = useState('');

  useEffect(() => {
    const decodedTitle = decodeURIComponent(title as string);
    const foundItem = savedItems.find(i => i.title === decodedTitle);
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
    setEditedText(markdownToHtml(editedMarkdown));
  }, [editedMarkdown]);

  const handleUpdate = () => {
    if (item) {
      const updatedItem = { ...item, editedText, editedMarkdown, updatedAt: new Date().toISOString() };
      const updatedItems = savedItems.map(i => (i.title === item.title ? updatedItem : i));
      setSavedItems(updatedItems);
      router.push('/extract-text/saved');
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
          <span onClick={() => router.push('/extract-text/saved')} className='flex items-center  text-sm cursor-pointer justify-center gap-1'>
              <ArrowLeft className="h-4 w-4" />
              Back
            </span>
          {/* <h1 className="text-lg font-medium">Edit: {item.fileName}</h1> */}
          </div>
          <div className="flex gap-2">
            <MarkdownPreviewDialog markdown={editedMarkdown} title={`Preview: ${item.fileName}`} triggerLabel="Preview" size="lg" />
            <Button onClick={handleUpdate}>
             
              Update
            </Button>
            <ExportMenu editedText={editedText} editedMarkdown={item.editedMarkdown} fileName={item.fileName} isProcessing={false} />
           
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
