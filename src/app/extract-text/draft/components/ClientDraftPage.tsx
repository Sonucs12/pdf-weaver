'use client';

import { FileEdit } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DraftCard } from './DraftCard';
import { useRouter } from 'next/navigation';

interface Draft {
  id: string;
  title: string;
  fileName: string;
  lastModified: string;
  preview: string;
  editedMarkdown: string;
}

export default function ClientDraftPage() {
  const [drafts, setDrafts] = useLocalStorage<Draft[]>('pdf-weaver-drafts', []);
  const router = useRouter();

  const handleDelete = (id: string) => {
    setDrafts(drafts.filter(draft => draft.id !== id));
  };

  return (
    <div className="flex-grow flex flex-col p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileEdit className="h-8 w-8" />
            Drafts
          </h1>
          <p className="text-muted-foreground">Your unsaved work in progress</p>
        </div>

        {drafts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Drafts</CardTitle>
              <CardDescription>
                You don't have any drafts yet. Create a new document to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

