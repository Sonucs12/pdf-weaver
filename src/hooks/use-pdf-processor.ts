'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { extractAndFormatPages } from '@/ai/flows';
import { parsePageRange } from '@/lib/utils/pdf-utils';
import type { Step } from '@/app/extract-text/create-new/components/types';

import { markdownToHtml } from '@/hooks/use-markdown-to-html';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface ProcessingState {
  currentImage: string | null;
  currentPage: number | null;
  message: string;
}

const CHUNK_SIZE = 2;
const ERROR_PATTERNS = {
  rateLimit: ['rate limit', 'too many requests', '429'],
  quota: ['quota', 'credit', 'balance'],
  network: ['api', 'network', 'fetch'],
  timeout: ['timeout', 'timed out'],
  auth: ['auth', 'unauthorized', '401'],
  server: ['500', '502', '503'],
  image: ['image', 'render', 'canvas']
} as const;

export function usePdfProcessor() {
  const [step, setStep] = useState<Step>('upload');
  const [editedText, setEditedText] = useState('');
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    currentImage: null,
    currentPage: null,
    message: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);
  const { toast } = useToast();

  const getUserFriendlyError = useCallback((error: string): string => {
    const errorLower = error.toLowerCase();
    
    if (ERROR_PATTERNS.rateLimit.some(p => errorLower.includes(p))) {
      return 'You\'ve reached the processing limit. Please wait a few minutes and try again.';
    }
    if (ERROR_PATTERNS.quota.some(p => errorLower.includes(p))) {
      return 'Your account has reached its usage limit. Please upgrade your plan or wait for the limit to reset.';
    }
    if (ERROR_PATTERNS.network.some(p => errorLower.includes(p))) {
      return 'Unable to connect to the processing service. Please check your internet connection and try again.';
    }
    if (ERROR_PATTERNS.timeout.some(p => errorLower.includes(p))) {
      return 'Processing is taking too long. Please try with fewer pages or a smaller PDF.';
    }
    if (ERROR_PATTERNS.auth.some(p => errorLower.includes(p))) {
      return 'Authentication failed. Please refresh the page and try again.';
    }
    if (ERROR_PATTERNS.server.some(p => errorLower.includes(p))) {
      return 'The processing service is temporarily unavailable. Please try again in a few moments.';
    }
    if (ERROR_PATTERNS.image.some(p => errorLower.includes(p))) {
      return 'Failed to process the PDF pages. The file might be corrupted or in an unsupported format.';
    }
    
    return 'Something went wrong during processing. Please try again or contact support if the issue persists.';
  }, []);

  const updateProcessingState = useCallback((updates: Partial<ProcessingState>) => {
    setProcessingState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
    updateProcessingState({ currentImage: null, currentPage: null });
  }, [updateProcessingState]);

  const handleProcessingError = useCallback((
    error: string,
    processedCount: number,
    totalPages: number,
    hasContent: boolean
  ) => {
    cancelRef.current = true;
    resetProcessing();
    
    const friendlyError = getUserFriendlyError(error);
    const description = hasContent 
      ? `${friendlyError} Kept ${processedCount} of ${totalPages} processed pages.`
      : friendlyError;

    toast({
      variant: 'destructive',
      title: hasContent ? 'Processing Stopped' : 'Processing Failed',
      description,
      duration: 6000,
    });
    
    setStep(hasContent ? 'edit' : 'select-page');
  }, [getUserFriendlyError, resetProcessing, toast]);

  const convertChunkToImages = useCallback(async (
    dataUri: string,
    pageNumbers: number[]
  ): Promise<string[]> => {
    const loadingTask = pdfjsLib.getDocument(dataUri);
    const pdf = await loadingTask.promise;
    const images: string[] = [];

    for (const pageNum of pageNumbers) {
      if (cancelRef.current) throw new Error('Processing cancelled by user');

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const base64 = canvas.toDataURL('image/jpeg', 0.75);
      images.push(base64.split(',')[1]);
      
      updateProcessingState({ currentImage: base64, currentPage: pageNum });
      
      canvas.width = canvas.height = 0;
    }

    return images;
  }, [updateProcessingState]);

  const processPdf = useCallback(async (rangeToProcess?: string) => {
    if (!pdfDataUri) return;
  
    cancelRef.current = false;
    setStep('processing');
    setIsProcessing(true);
    updateProcessingState({ 
      currentImage: null, 
      currentPage: null, 
      message: 'Starting PDF processing...' 
    });

    try {
      const pagesToProcess = parsePageRange(rangeToProcess || '1', pageCount);
      if (!pagesToProcess) throw new Error('Invalid page range provided.');
      
      const totalPages = pagesToProcess.length;
      let allFormattedText = '';
      let processedCount = 0;

      updateProcessingState({ message: 'Converting PDF pages to images for AI processing...' });
      
      for (let i = 0; i < totalPages; i += CHUNK_SIZE) {
        if (cancelRef.current) {
          resetProcessing();
          toast({
            title: 'Processing Cancelled',
            description: allFormattedText.trim() 
              ? `Kept ${processedCount} of ${totalPages} processed pages.`
              : 'No pages were processed.',
          });
          setStep(allFormattedText.trim() ? 'edit' : 'select-page');
          return;
        }

        const chunk = pagesToProcess.slice(i, Math.min(i + CHUNK_SIZE, totalPages));

        updateProcessingState({ 
          message: `Converting pages ${chunk[0]}-${chunk[chunk.length - 1]} to images...` 
        });

        const chunkImages = await convertChunkToImages(pdfDataUri, chunk);

        if (cancelRef.current) {
          resetProcessing();
          toast({
            title: 'Processing Cancelled',
            description: allFormattedText.trim() 
              ? `Kept ${processedCount} of ${totalPages} processed pages.`
              : 'No pages were processed.',
          });
          setStep(allFormattedText.trim() ? 'edit' : 'select-page');
          return;
        }

        updateProcessingState({ 
          message: `Processing pages ${chunk[0]}-${chunk[chunk.length - 1]} of ${totalPages}...` 
        });

        let results;
        try {
          results = await extractAndFormatPages({ images: chunkImages, pageNumbers: chunk });
        } catch (error) {
          const rawError = error instanceof Error ? error.message : 'AI processing failed';
          handleProcessingError(rawError, processedCount, totalPages, allFormattedText.trim().length > 0);
          return;
        }

        if (cancelRef.current) {
          resetProcessing();
          toast({
            title: 'Processing Cancelled',
            description: allFormattedText.trim() 
              ? `Kept ${processedCount} of ${totalPages} processed pages.`
              : 'No pages were processed.',
          });
          setStep(allFormattedText.trim() ? 'edit' : 'select-page');
          return;
        }

                for (const result of results) {

                  if (result.success && result.formattedText?.trim()) {

                    const separator = allFormattedText ? '\n\n---\n\n' : '';

                    allFormattedText += separator + result.formattedText.trim();

                    setEditedMarkdown(allFormattedText);

                    const html = markdownToHtml(allFormattedText);

                    setEditedText(html);
            if (processedCount === 0) setStep('edit');
            
            processedCount++;
            updateProcessingState({ message: `Completed ${processedCount} of ${totalPages} pages...` });
          } else if (!result.success) {
            const errorMsg = result.error?.toLowerCase() || '';
            const isCriticalError = ['rate limit', 'quota', 'api', 'limit exceeded']
              .some(pattern => errorMsg.includes(pattern));
            
            if (isCriticalError) {
              handleProcessingError(
                result.error || 'Unknown error', 
                processedCount, 
                totalPages, 
                allFormattedText.trim().length > 0
              );
              return;
            } else {
              toast({
                title: 'Page Processing Warning',
                description: `Page ${result.pageNumber}: ${getUserFriendlyError(result.error || 'Unknown error')}`,
                duration: 5000,
              });
            }
          }
        }

        chunkImages.length = 0;
        updateProcessingState({ currentImage: null, currentPage: null });
        
        if (typeof global !== 'undefined' && global.gc) global.gc();
      }

      if (!allFormattedText.trim()) throw new Error('Failed to extract any text from the selected page(s).');

      updateProcessingState({ message: `Successfully processed ${processedCount} of ${totalPages} pages!` });
      resetProcessing();

    } catch (error) {
      resetProcessing();
      
      if (error instanceof Error && error.message === 'Processing cancelled by user') {
        toast({
          title: 'Processing Cancelled',
          description: editedText.trim() ? 'Kept processed content.' : 'No pages were processed.',
          duration: 4000,
        });
        setStep(editedText.trim() ? 'edit' : 'select-page');
        return;
      }
      
      const rawError = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: getUserFriendlyError(rawError),
        duration: 6000,
      });
      handleReset();
    }
  }, [pdfDataUri, pageCount, convertChunkToImages, editedText, toast, getUserFriendlyError, handleProcessingError, resetProcessing, updateProcessingState]);

  const handleCancelProcessing = useCallback(() => {
    cancelRef.current = true;
    updateProcessingState({ message: 'Cancelling processing...' });
  }, [updateProcessingState]);

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
    updateProcessingState({ message: 'Reading PDF file...' });

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const dataUri = `data:application/pdf;base64,${btoa(binary)}`;
        
        updateProcessingState({ message: 'Loading PDF...' });
        
        const loadingTask = pdfjsLib.getDocument(dataUri);
        const pdf = await loadingTask.promise;
        const count = pdf.numPages;
        
        setPageCount(count);
        setPdfDataUri(dataUri);

        if (count > 1) {
          setPageRange(`1-${count}`);
          setStep('select-page');
        } else {
          await processPdf('1');
        }
      } catch (error) {
        const rawError = error instanceof Error ? error.message : 'Could not read the PDF file';
        toast({
          variant: 'destructive',
          title: 'PDF Loading Failed',
          description: getUserFriendlyError(rawError),
          duration: 6000,
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
  }, [toast, processPdf, getUserFriendlyError, updateProcessingState]);

  const handleDragEvents = useCallback((isEntering: boolean) => {
    setIsDragging(isEntering);
  }, []);

  const handleReset = useCallback(() => {
    cancelRef.current = false;
    setStep('upload');
    setEditedText('');
    setFileName('');
    setPdfDataUri(null);
    setPageCount(0);
    setPageRange('1');
    setIsProcessing(false);
    setProcessingState({ currentImage: null, currentPage: null, message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return useMemo(() => ({
    step,
    editedText,
    editedMarkdown,
    fileName,
    isDragging,
    pageCount,
    pageRange,
    progressMessage: processingState.message,
    isProcessing,
    currentProcessingImage: processingState.currentImage,
    currentProcessingPage: processingState.currentPage,
    fileInputRef,
    setEditedText,
    setPageRange,
    processPdf,
    handleFileSelect,
    handleDragEvents,
    handleReset,
    handleCancelProcessing,
  }), [
    step, editedText, editedMarkdown, fileName, isDragging, pageCount, pageRange,
    processingState, isProcessing, processPdf, handleFileSelect,
    handleDragEvents, handleReset, handleCancelProcessing
  ]);
}