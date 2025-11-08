"use client"
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutoSaveDraft } from '@/hooks/use-auto-save-draft';
import { DraftCard } from './DraftCard';
interface Draft {
  id: string;
  title: string;
  fileName: string;
  lastModified: string;
  preview: string;
  editedMarkdown: string;
}

export default function ClientDraftPage() {
  const { drafts, draftsArray, setDrafts } = useAutoSaveDraft();
  
  const handleDelete = (id: string) => {
    const { [id]: _, ...rest } = drafts;
    setDrafts(rest);
  };

  return (
    <div className="flex-grow flex flex-col p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Drafts
          </h1>
          <p className="text-muted-foreground text-sm">Your unsaved work in progress</p>
        </div>

        {draftsArray.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Drafts</CardTitle>
              <CardDescription>
                You don't have any drafts yet. Create a new document to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-md">
            {draftsArray.map((draft) => (
              <DraftCard key={draft.id} draft={draft} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

