import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/dateFormatter';
import { SaveButton } from '@/app/extract-text/create-new/components/SaveButton';
import { EditButton } from '@/app/extract-text/components/EditButton';

interface Draft {
  id: string;
  title: string;
  fileName: string;
  lastModified: string;
  preview: string;
  editedMarkdown: string;
}

interface DraftCardProps {
  draft: Draft;
  onDelete: (id: string) => void;
  onEdit: (draft: Draft) => void;
}

export function DraftCard({ draft, onDelete, onEdit }: DraftCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    await onDelete(draft.id);
    setIsDeleting(false);
  };

  const handleSaveSuccess = () => {
    onDelete(draft.id); // Remove from drafts after saving
  };

  return (
    <Card className='flex justify-between flex-col'>
      <CardHeader>
        <CardTitle className='text-md'>{draft.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm mb-1">{draft.fileName}</p>
        <p className="text-xs text-muted-foreground">Last modified: {formatDate(draft.lastModified)}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{draft.preview}</p>
      </CardContent>
      <CardFooter className="flex mt-auto justify-end items-end gap-2">
        <EditButton id={draft.id} title={draft.title} onClick={() => onEdit(draft)} />
        <SaveButton
          fileName={draft.fileName}
          editedText={draft.editedMarkdown}
          editedMarkdown={draft.editedMarkdown}
          onSave={handleSaveSuccess}
        />
        <Button variant="destructive" size={"icon"} onClick={handleDeleteClick} disabled={isDeleting}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
