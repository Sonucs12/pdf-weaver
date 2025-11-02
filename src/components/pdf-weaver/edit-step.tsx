'use client';

import { FileText, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownPreview } from './markdown-preview';

interface EditStepProps {
  fileName: string;
  editedText: string;
  onTextChange: (text: string) => void;
  onDownload: () => void;
  onReset: () => void;
}

export function EditStep({
  fileName,
  editedText,
  onTextChange,
  onDownload,
  onReset,
}: EditStepProps) {
  return (
    <div className="w-full max-w-4xl h-[75vh] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />Start Over
          </Button>
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />Download .md
          </Button>
        </div>
      </div>
      <Tabs defaultValue="write" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="flex-grow mt-2">
          <Textarea
            value={editedText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Your formatted text will appear here..."
            className="flex-grow w-full h-full resize-none text-base leading-relaxed shadow-lg"
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-grow mt-2">
          <MarkdownPreview markdown={editedText} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

