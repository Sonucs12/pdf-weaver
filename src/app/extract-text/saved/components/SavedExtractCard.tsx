'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface SavedExtractCardProps {
  fileName: string;
  content: string;
  onDelete: (fileName: string) => void;
}

export function SavedExtractCard({ fileName, content, onDelete }: SavedExtractCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-md'>{fileName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Link href={`/extract-text/saved/${encodeURIComponent(fileName)}`}>
          <Button variant="outline" size={"icon"}>
            <Pencil className="h-4 w-4" />
            
          </Button>
        </Link>
        <Button variant="destructive" size={"icon"} onClick={() => onDelete(fileName)}>
          <Trash2 className="h-4 w-4" />
         
        </Button>
      </CardFooter>
    </Card>
  );
}
