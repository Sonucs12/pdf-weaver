'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface SavedExtractCardProps {
  title: string;
  fileName: string;
  onDelete: (title: string) => void;
}

export function SavedExtractCard({ title, fileName, onDelete }: SavedExtractCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-md'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm">{fileName}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Link href={`/extract-text/saved/${encodeURIComponent(title)}`}>
          <Button variant="outline" size={"icon"}>
            <Pencil className="h-4 w-4" />
            
          </Button>
        </Link>
        <Button variant="destructive" size={"icon"} onClick={() => onDelete(title)}>
          <Trash2 className="h-4 w-4" />
         
        </Button>
      </CardFooter>
    </Card>
  );
}
