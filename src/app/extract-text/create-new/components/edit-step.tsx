'use client';

import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from './rich-text-editor';
import { CancelButton } from './CancelButton';
import { ExportMenu } from './ExportMenu';
import { SaveButton } from './SaveButton';

interface EditStepProps {
  fileName: string;
  editedText: string;
  editedMarkdown: string;
  onTextChange: (text: string) => void;
  onReset: () => void;
  isProcessing?: boolean;
  progressMessage?: string;
  onCancel: () => void;
}

export function EditStep({
  fileName,
  editedText,
  editedMarkdown,
  onTextChange,
  onReset,
  isProcessing = false,
  progressMessage,
  onCancel,
}: EditStepProps) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset} disabled={isProcessing}>
          Start Over
          </Button>
          <SaveButton fileName={fileName} editedText={editedText} editedMarkdown={editedMarkdown} />
          <ExportMenu editedText={editedText} editedMarkdown={editedMarkdown} fileName={fileName} isProcessing={isProcessing} />
        </div>
      </div>
      {isProcessing && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-900 dark:text-blue-100">
              {progressMessage || 'Processing pages...'}
            </p></div>
            <CancelButton onCancel={onCancel} isProcessing={isProcessing} />
          
        </div>
      )}
      <Tabs defaultValue="write" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="flex-grow mt-2">
          <RichTextEditor
            content={editedText}
            onChange={onTextChange}
            placeholder="Write or edit your content..."
            className="min-h-[300px]"
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-grow mt-2">
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: editedText }} />
          </div>
        </TabsContent>
      </Tabs>
    
    </div>
  );
}

