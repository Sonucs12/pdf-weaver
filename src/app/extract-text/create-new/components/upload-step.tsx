'use client';

import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UploadStepProps {
  isDragging: boolean;
  onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileSelect: (files: FileList | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function UploadStep({
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  fileInputRef,
}: UploadStepProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  return (
    <div
      className="w-full  text-center shadow-lg transition-all duration-300"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Upload Your PDF or Images</CardTitle>
        <CardDescription>Drag and drop your files or click to select.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          )}
        >
          <Upload className={cn("h-12 w-12 mb-4 transition-transform duration-300", isDragging ? 'scale-110 text-primary' : 'text-muted-foreground')} />
          <p className="text-muted-foreground">
            {isDragging ? 'Drop it like it\'s hot!' : 'Click or drag PDF or image files here'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      </CardContent>
    </div>
  );
}

