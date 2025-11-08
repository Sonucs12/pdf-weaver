'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EditButton } from '../../components/EditButton';
interface SavedExtractCardProps {
  id: string;
  title: string;
  fileName: string;
  onDelete: (id: string) => void;
  createdAt?: string;
  updatedAt?: string;
}

export function SavedExtractCard({ id, title, fileName, onDelete, createdAt, updatedAt }: SavedExtractCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    await onDelete(id);
    setIsDeleting(false);
  };

  return (
    <Card className='flex justify-between flex-col'>
      <CardHeader>
        <CardTitle className='text-sm line-clamp-2'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm mb-1">{fileName}</p>
        {updatedAt && <p className="text-xs text-muted-foreground">Updated at {formatDate(updatedAt, 'PP')}</p>}
        {!updatedAt && createdAt && <p className="text-xs text-muted-foreground">Created at {formatDate(createdAt, 'PP')}</p>}
      </CardContent>
      <CardFooter className="flex mt-auto justify-end items-end gap-2">
        <EditButton id={id} title={title}/>
        <Button variant="destructive" size={"icon"} onClick={handleDeleteClick} loading={isDeleting}>
          <Trash2 className="h-4 w-4" />
         
        </Button>
      </CardFooter>
    </Card>
  );
}
