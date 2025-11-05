'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAutoSaveDraft } from '@/hooks/use-auto-save-draft';
import { WyngEditor } from '@/app/extract-text/components/WyngEditor';
import { MarkdownPreviewDialog } from '@/app/extract-text/components/MarkdownPreviewDialog';
import { CancelButton } from './CancelButton';
import { ExportMenu } from './ExportMenu';

import { SaveButton } from './SaveButton';

interface EditStepProps {
  fileName: string;
  editedMarkdown: string;
  editedText: string;
  onTextChange: (text: string) => void;
  onReset: () => void;
  onBack: () => void;
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
  onBack,
  isProcessing = false,
    progressMessage,
        onCancel,
      }: EditStepProps) {
        const { saveDraft } = useAutoSaveDraft();
        const [isDirty, setIsDirty] = useState(true);
      
        const handleTextChange = (text: string) => {
          onTextChange(text);
          setIsDirty(true);
        };
      
        const handleSave = () => {
          setIsDirty(false);
        };
      
        const handleBackClick = () => {
          if (isDirty && editedMarkdown.trim()) {
            saveDraft(editedMarkdown, fileName);
          }
          onBack();
        };    
      return (
        <div className="w-full flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Button variant="outline" size="icon" onClick={handleBackClick} disabled={isProcessing}>            <ArrowLeft className="h-4 w-4" />
          </Button>
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReset} disabled={isProcessing}>
          Start Over
          </Button>
          <MarkdownPreviewDialog markdown={editedMarkdown} title="Preview Content" triggerLabel="Preview" size="lg" />
          <SaveButton fileName={fileName} editedText={editedText} editedMarkdown={editedMarkdown} onSave={handleSave} />
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
      <div className="flex-grow mt-2">
        <WyngEditor
          markdown={editedMarkdown}
          onChange={handleTextChange}
          placeholder="Write or edit your content..."
          className="min-h-[300px]"
        />
      </div>
    </div>
  );
}
