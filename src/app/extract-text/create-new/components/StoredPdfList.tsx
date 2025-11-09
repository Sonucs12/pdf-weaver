'use client';

import { useEffect, useState } from 'react';
import { useIndexedDB } from '@/hooks/use-indexed-db';
import { Badge } from '@/components/ui/badge';
import { X, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface StoredPdf {
  id: string;
  name: string;
  file: File;
  uploadedAt: Date;
}

interface StoredPdfListProps {
  onSelectPdf: (pdf: StoredPdf) => void;
}

export function StoredPdfList({ onSelectPdf }: StoredPdfListProps) {
  const { getAll, remove } = useIndexedDB<StoredPdf>('uploadedPdfs');
  const [storedPdfs, setStoredPdfs] = useState<StoredPdf[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const pdfs = (await getAll()) as StoredPdf[];
        if (pdfs) {
          // Sort by most recently uploaded
          pdfs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          setStoredPdfs(pdfs);
        }
      } catch (error) {
        console.error("Failed to fetch stored PDFs:", error);
        toast({
          variant: 'destructive',
          title: 'Could not load saved PDFs',
          description: 'There was an error fetching your previously uploaded PDFs from the browser.',
        });
      }
    };
    fetchPdfs();
  }, [getAll, toast]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent the badge's onClick from firing
    try {
      await remove(id);
      setStoredPdfs(prevPdfs => prevPdfs.filter(pdf => pdf.id !== id));
      toast({
        title: 'PDF Removed',
        description: 'The saved PDF has been removed from your browser storage.',
      });
    } catch (error) {
      console.error("Failed to delete PDF:", error);
      toast({
        variant: 'destructive',
        title: 'Error removing PDF',
        description: 'Could not remove the saved PDF.',
      });
    }
  };

  if (storedPdfs.length === 0) {
    return null; // Don't render anything if there are no saved PDFs
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-center mb-4">Or select a recent PDF</h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {storedPdfs.map(pdf => (
          <Badge
            key={pdf.id}
            variant="outline"
            className="cursor-pointer hover:bg-accent text-base p-2 pr-3"
            onClick={() => onSelectPdf(pdf)}
          >
            <File className="h-4 w-4 mr-2" />
            <span className="truncate max-w-[200px]" title={pdf.name}>{pdf.name}</span>
            <div 
              className="ml-2 p-1 rounded-full hover:bg-destructive/20"
              onClick={(e) => handleDelete(e, pdf.id)}
              title="Remove from list"
            >
              <X className="h-3 w-3" />
            </div>
          </Badge>
        ))}
      </div>
    </div>
  );
}