'use client';

import { Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';

interface SavedDocument {
  id: string;
  fileName: string;
  savedDate: string;
  preview: string;
}

export default function SavedPage() {
  // TODO: Fetch saved documents from storage/API
  const savedDocuments: SavedDocument[] = [];

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

        {savedDocuments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Saved Documents</CardTitle>
              <CardDescription>
                You don't have any saved documents yet. Create and save a document to see it here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedDocuments.map((doc) => (
              <Card key={doc.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{doc.fileName}</CardTitle>
                  <CardDescription>
                    Saved on: {doc.savedDate}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {doc.preview}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

