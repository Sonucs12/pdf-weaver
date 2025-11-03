'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { RichTextEditor } from '@/app/extract-text/create-new/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { ExportMenu } from '@/app/extract-text/create-new/components/ExportMenu';
import { markdownToHtml } from '@/hooks/use-markdown-to-html';

interface SavedItem {
  fileName: string;
  editedText: string;
  editedMarkdown: string;
  savedAt: string;
}

export default function EditSavedPage() {
  const router = useRouter();
  const params = useParams();
  const { fileName } = params;
  const [savedItems, setSavedItems] = useLocalStorage<SavedItem[]>('saved-extracts', []);
  const [item, setItem] = useState<SavedItem | null>(null);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    const decodedFileName = decodeURIComponent(fileName as string);
    const foundItem = savedItems.find(i => i.fileName === decodedFileName);
    if (foundItem) {
      setItem(foundItem);
      setEditedText(foundItem.editedText);
    } else {
      // Handle item not found, maybe redirect or show an error
      router.push('/extract-text/saved');
    }
  }, [fileName, savedItems, router]);

  const handleUpdate = () => {
    if (item) {
      // A simple conversion, you might want a more robust library for complex HTML
      const htmlToMarkdown = (html: string) => {
        return html
          .replace(/<br>/g, '\n')
          .replace(/<h3>/g, '### ')
          .replace(/<h2>/g, '## ')
          .replace(/<h1>/g, '# ')
          .replace(/<\/h[1-3]>/g, '\n')
          .replace(/<p>/g, '')
          .replace(/<\/p>/g, '\n')
          .replace(/<strong>/g, '**')
          .replace(/<\/strong>/g, '**')
          .replace(/<em>/g, '*')
          .replace(/<\/em>/g, '*')
          .replace(/<a href="(.*?)'>(.*?)<\/a>/g, '[$2]($1)')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
      };
      const updatedMarkdown = htmlToMarkdown(editedText);
      const updatedItem = { ...item, editedText, editedMarkdown: updatedMarkdown, savedAt: new Date().toISOString() };
      const updatedItems = savedItems.map(i => (i.fileName === item.fileName ? updatedItem : i));
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
            <Button onClick={handleUpdate}>
             
              Update
            </Button>
            <ExportMenu editedText={editedText} editedMarkdown={item.editedMarkdown} fileName={item.fileName} isProcessing={false} />
           
          </div>
        </div>
        <RichTextEditor
          content={editedText}
          onChange={setEditedText}
          placeholder="Edit your content..."
        />
      </div>
    </div>
  );
}
