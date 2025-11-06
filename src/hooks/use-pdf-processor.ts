'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useAutoSaveDraft } from '@/hooks/use-auto-save-draft';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { extractAndFormatPages } from '@/ai/flows';
import { useGenerationTracker } from '@/hooks/use-generation-tracker';
import { MAX_PAGES_ALLOWED, MAX_PDF_GENERATIONS } from '@/lib/security';
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
  const base64WorkerRef = useRef<Worker | null>(null);
  const renderWorkerRef = useRef<Worker | null>(null);
  const { toast } = useToast();
  const { saveDraft } = useAutoSaveDraft();
  const { generationCount, incrementGenerationCount, isLoading: isGenerationCountLoading } = useGenerationTracker();

  // Initialize Web Workers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        base64WorkerRef.current = new Worker(new URL('../workers/base64Worker.js', import.meta.url));
        renderWorkerRef.current = new Worker(new URL('../workers/renderWorker.js', import.meta.url));

        // Helpful error logs in case worker script fails to load (e.g., CSP/CDN issues)
        base64WorkerRef.current.addEventListener('error', (err) => {
          console.warn('Base64 worker error:', err);
        });
        renderWorkerRef.current.addEventListener('error', (err) => {
          console.warn('Render worker error:', err);
        });

        console.log('[PDF Weaver] Workers initialized: base64 + render');

        return () => {
          if (base64WorkerRef.current) {
            base64WorkerRef.current.terminate();
            base64WorkerRef.current = null;
          }
          if (renderWorkerRef.current) {
            renderWorkerRef.current.terminate();
            renderWorkerRef.current = null;
          }
        };
      } catch (error) {
        console.warn('Web Workers not available, falling back to main thread');
      }
    }
  }, []);

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
    hasContent: boolean,
    allFormattedText: string
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
    
    if (hasContent) {
      saveDraft(allFormattedText, fileName);
    }
    setStep(hasContent ? 'edit' : 'select-page');
  }, [getUserFriendlyError, resetProcessing, toast, fileName, saveDraft]);

  // New: Convert pages to images using Worker
  const convertChunkToImagesWithWorker = useCallback(async (
    dataUri: string,
    pageNumbers: number[]
  ): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      if (!renderWorkerRef.current) {
        console.log('[PDF Weaver] Render: falling back to main thread (no worker)');
        // Fallback to main thread rendering
        return convertChunkToImagesMainThread(dataUri, pageNumbers)
          .then(resolve)
          .catch(reject);
      }

      console.log('[PDF Weaver] Render: using worker');
      const handleMessage = (e: MessageEvent) => {
        const { type, images, error, pageNum, preview } = e.data;
        
        if (type === 'PROGRESS') {
          updateProcessingState({ 
            currentImage: preview,
            currentPage: pageNum
          });
        } else if (type === 'SUCCESS') {
          renderWorkerRef.current?.removeEventListener('message', handleMessage);
          renderWorkerRef.current?.removeEventListener('error', handleErrorEvent);
          console.log('[PDF Weaver] Render worker: success');
          resolve(images);
        } else if (type === 'ERROR') {
          renderWorkerRef.current?.removeEventListener('message', handleMessage);
          renderWorkerRef.current?.removeEventListener('error', handleErrorEvent);
          // Fallback to main thread on worker-reported error
          console.warn('[PDF Weaver] Render worker: reported error, falling back to main thread:', error);
          convertChunkToImagesMainThread(dataUri, pageNumbers).then(resolve).catch(reject);
        }
      };

      const handleErrorEvent = () => {
        renderWorkerRef.current?.removeEventListener('message', handleMessage);
        renderWorkerRef.current?.removeEventListener('error', handleErrorEvent);
        // Fallback to main thread on worker load/runtime error
        console.warn('[PDF Weaver] Render worker: runtime/load error, falling back to main thread');
        convertChunkToImagesMainThread(dataUri, pageNumbers).then(resolve).catch(reject);
      };

      renderWorkerRef.current.addEventListener('message', handleMessage);
      renderWorkerRef.current.addEventListener('error', handleErrorEvent);
      renderWorkerRef.current.postMessage({
        type: 'RENDER_PAGES',
        data: { pdfDataUri: dataUri, pageNumbers }
      });
    });
  }, [updateProcessingState]);

  // Fallback: Main thread rendering (original method)
  const convertChunkToImagesMainThread = useCallback(async (
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

    if (generationCount !== null && generationCount >= MAX_PDF_GENERATIONS) {
      toast({
        variant: 'destructive',
        title: 'Generation Limit Reached',
        description: `You have reached the maximum of ${MAX_PDF_GENERATIONS} PDF generations.`,
      });
      return;
    }
  
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
      if (!pagesToProcess) {
        toast({
          variant: 'destructive',
          title: 'Invalid Page Range',
          description: `You can only process up to ${MAX_PAGES_ALLOWED} pages at a time.`,
        });
        resetProcessing();
        setStep('select-page');
        return;
      }
      
      const totalPages = pagesToProcess.length;
      let allFormattedText = '';
      let processedCount = 0;

      updateProcessingState({ message: 'Converting PDF pages to images...' });
      
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

        // Use worker for rendering
        const chunkImages = await convertChunkToImagesWithWorker(pdfDataUri, chunk);

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
          handleProcessingError(rawError, processedCount, totalPages, allFormattedText.trim().length > 0, allFormattedText);
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
                allFormattedText.trim().length > 0,
                allFormattedText
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
      await incrementGenerationCount();
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
  }, [pdfDataUri, pageCount, convertChunkToImagesWithWorker, editedText, toast, getUserFriendlyError, handleProcessingError, resetProcessing, updateProcessingState]);

  const handleCancelProcessing = useCallback(() => {
    cancelRef.current = true;
    updateProcessingState({ message: 'Cancelling processing...' });
  }, [updateProcessingState]);

  // Convert ArrayBuffer to Base64 using Web Worker
  const convertToBase64WithWorker = useCallback((arrayBuffer: ArrayBuffer): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!base64WorkerRef.current) {
        console.log('[PDF Weaver] Base64: falling back to main thread (no worker)');
        // Fallback to main thread if worker not available
        try {
          const uint8Array = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const dataUri = `data:application/pdf;base64,${btoa(binary)}`;
          resolve(dataUri);
        } catch (error) {
          reject(error);
        }
        return;
      }

      console.log('[PDF Weaver] Base64: using worker');
      const handleMessage = (e: MessageEvent) => {
        const { type, dataUri, error, progress } = e.data;
        
        if (type === 'PROGRESS') {
          updateProcessingState({ message: `Preparing PDF... ${progress}%` });
        } else if (type === 'SUCCESS') {
          base64WorkerRef.current?.removeEventListener('message', handleMessage);
          console.log('[PDF Weaver] Base64 worker: success');
          resolve(dataUri);
        } else if (type === 'ERROR') {
          base64WorkerRef.current?.removeEventListener('message', handleMessage);
          console.warn('[PDF Weaver] Base64 worker: reported error');
          reject(new Error(error));
        }
      };

      base64WorkerRef.current.addEventListener('message', handleMessage);
      base64WorkerRef.current.postMessage({
        type: 'CONVERT_TO_BASE64',
        data: { arrayBuffer }
      });
    });
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
        
        // Use Web Worker for base64 conversion (progress updates handled in worker)
        const dataUri = await convertToBase64WithWorker(arrayBuffer);
        
        const loadingTask = pdfjsLib.getDocument(dataUri);
        const pdf = await loadingTask.promise;
        const count = pdf.numPages;
        
        setPageCount(count);
        setPdfDataUri(dataUri);

        if (count > 1) {
          setPageRange(`1-${count}`);
          setStep('select-page');
          updateProcessingState({ message: '' });
        } else {
          await processPdf('1');
        }
      } catch (error) {
        console.error('PDF Loading Error:', error);
        const rawError = error instanceof Error ? error.message : 'Could not read the PDF file';
        const errorDetails = error instanceof Error ? error.stack : '';
        
        toast({
          variant: 'destructive',
          title: 'PDF Loading Failed',
          description: getUserFriendlyError(rawError),
          duration: 6000,
        });
        
        // Log detailed error for debugging
        if (errorDetails) {
          console.error('Error details:', errorDetails);
        }
        
        handleReset();
      }
    };
    
    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Failed to read the file. The file may be corrupted or too large.',
      });
      handleReset();
    };
  }, [toast, processPdf, getUserFriendlyError, updateProcessingState, convertToBase64WithWorker]);

  const handleDragEvents = useCallback((isEntering: boolean) => {
    setIsDragging(isEntering);
  }, []);

  const handleReset = useCallback(() => {
    cancelRef.current = false;
    setStep('upload');
    setEditedText('');
    setEditedMarkdown('');
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
    setStep,
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
    setEditedMarkdown,
    setPageRange,
    processPdf,
    handleFileSelect,
    handleDragEvents,
    handleReset,
    handleCancelProcessing,
  }), [
    step, setStep, editedText, editedMarkdown, fileName, isDragging, pageCount, pageRange,
    processingState, isProcessing, processPdf, handleFileSelect,
    handleDragEvents, handleReset, handleCancelProcessing
  ]);
}