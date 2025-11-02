'use client';

import { FileEdit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Draft {
  id: string;
  fileName: string;
  lastModified: string;
  preview: string;
}

export default function DraftPage() {
  // TODO: Fetch drafts from storage/API
  const drafts: Draft[] = [];

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
              <Card key={draft.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{draft.fileName}</CardTitle>
                  <CardDescription>
                    Last modified: {draft.lastModified}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {draft.preview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

