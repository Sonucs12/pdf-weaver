'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, FileText, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EditButton } from '../../components/EditButton';

interface SavedExtractCardProps {
  item: {
    id: string;
    title: string;
    fileName: string;
    pageRange: string;
    createdAt?: string;
    updatedAt?: string;
  };
  onDelete: (id: string) => void;
}

export function SavedExtractCard({ item, onDelete }: SavedExtractCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
  };

  return (
    <Card className="flex justify-between flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base line-clamp-2 font-semibold">
          {item.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground line-clamp-1">
            {item.fileName}
          </p>
        </div>
        
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
           Last extracted page range <span className="font-medium text-foreground">{item.pageRange}</span>
          </p>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 text-primary" />
            {item.updatedAt ? (
              <span>Updated {formatDate(item.updatedAt, 'PP')}</span>
            ) : item.createdAt ? (
              <span>Created {formatDate(item.createdAt, 'PP')}</span>
            ) : null}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex mt-auto justify-end items-end gap-2 pt-4">
        <EditButton id={item.id} title={item.title} />
        <Button 
          variant="destructive" 
          size="icon" 
          onClick={handleDeleteClick} 
          loading={isDeleting}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}