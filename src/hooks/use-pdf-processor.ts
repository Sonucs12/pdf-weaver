'use client';

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromPdfSupabase, formatContent } from '@/ai/flows';
import { createSupabaseClient } from '@/lib/supabase';
import { parsePageRange } from '@/lib/utils/pdf-utils';
import type { Step } from '@/components/pdf-weaver/types';

// Set worker source for pdfjs (only in browser)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export function usePdfProcessor() {
  const [step, setStep] = useState<Step>('upload');
  const [editedText, setEditedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState('1');
  const [progressMessage, setProgressMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processPdf = useCallback(async (rangeToProcess?: string) => {
    if (!pdfDataUri) return;
  
    setStep('processing');
    setProgressMessage('Initializing...');
    try {
      const pagesToProcess = parsePageRange(rangeToProcess || '1', pageCount);
      if (!pagesToProcess) {
        throw new Error('Invalid page range provided.');
      }
  
      const loadingTask = pdfjsLib.getDocument(pdfDataUri);
      const pdf = await loadingTask.promise;
  
      let allExtractedText = '';
      const totalPages = pagesToProcess.length;
  
      for (let i = 0; i < totalPages; i++) {
        const pageNum = pagesToProcess[i];
        setProgressMessage(`Processing page ${i + 1} of ${totalPages}...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
  
        if (!context) {
          throw new Error('Could not get canvas context');
        }
  
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
  
        await page.render(renderContext).promise;
  
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) {
          toast({
            variant: 'destructive',
            title: 'Image Conversion Failed',
            description: `Could not convert page ${pageNum} to an image.`,
          });
          continue;
        }

        const supabase = createSupabaseClient();
        const filePath = `pages/${Date.now()}-${pageNum}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdf-pages')
          .upload(filePath, blob);

        if (uploadError) {
          throw new Error(`Supabase upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from('pdf-pages').getPublicUrl(uploadData.path);

        if (!publicUrlData?.publicUrl) {
          throw new Error('Could not get public URL for the uploaded image.');
        }

        const result = await extractTextFromPdfSupabase({
          imageUrl: publicUrlData.publicUrl,
          pageNumber: pageNum,
          path: uploadData.path,
        });

        if (result?.extractedText?.trim()) {
            allExtractedText += `\n\n${result.extractedText}`;
        }
      }
  
      if (!allExtractedText.trim()) {
        throw new Error('Failed to extract any text from the selected page(s).');
      }
  
      setProgressMessage('Formatting content...');
      const { formattedText } = await formatContent({ text: allExtractedText.slice(0, 20000) });
  
      setEditedText(formattedText);
      setStep('edit');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      handleReset();
    }
  }, [pdfDataUri, toast, pageCount]);

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
      });
      return;
    }

    setFileName(file.name);
    setStep('processing');
    setProgressMessage('Reading PDF file...');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setPdfDataUri(dataUri);

      try {
        const pdfDoc = await PDFDocument.load(dataUri);
        const count = pdfDoc.getPageCount();
        setPageCount(count);

        if (count > 1) {
          setPageRange(`1-${count}`);
          setStep('select-page');
        } else {
          await processPdf('1');
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'PDF Loading Failed',
          description: 'Could not read the PDF file to determine page count.',
        });
        handleReset();
      }
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Failed to read the file.',
      });
      handleReset();
    };
  }, [toast, processPdf]);

  const handleDragEvents = useCallback((isEntering: boolean) => {
    setIsDragging(isEntering);
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([editedText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.pdf$/i, '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editedText, fileName]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setEditedText('');
    setFileName('');
    setPdfDataUri(null);
    setPageCount(0);
    setPageRange('1');
    setProgressMessage('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  return {
    // State
    step,
    editedText,
    fileName,
    isDragging,
    pageCount,
    pageRange,
    progressMessage,
    fileInputRef,
    
    // Actions
    setEditedText,
    setPageRange,
    processPdf,
    handleFileSelect,
    handleDragEvents,
    handleDownload,
    handleReset,
  };
}

