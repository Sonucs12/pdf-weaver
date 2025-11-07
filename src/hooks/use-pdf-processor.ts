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
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [imageDataUris, setImageDataUris] = useState<string[]>([]);
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
  const imageWorkerRef = useRef<Worker | null>(null);
  const { toast } = useToast();
  const { saveDraft } = useAutoSaveDraft();
  const { generationCount, incrementGenerationCount, isLoading: isGenerationCountLoading } = useGenerationTracker();

  // Initialize Web Workers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        base64WorkerRef.current = new Worker(new URL('../workers/base64Worker.js', import.meta.url));
        renderWorkerRef.current = new Worker(new URL('../workers/renderWorker.js', import.meta.url));
        imageWorkerRef.current = new Worker(new URL('../workers/imageWorker.js', import.meta.url));

        // Helpful error logs in case worker script fails to load (e.g., CSP/CDN issues)
        base64WorkerRef.current.addEventListener('error', (err) => {
          console.warn('Base64 worker error:', err);
        });
        renderWorkerRef.current.addEventListener('error', (err) => {
          console.warn('Render worker error:', err);
        });
        imageWorkerRef.current.addEventListener('error', (err) => {
          console.warn('Image worker error:', err);
        });

        console.log('[PDFWrite] Workers initialized: base64 + render + image');

        return () => {
          if (base64WorkerRef.current) {
            base64WorkerRef.current.terminate();
            base64WorkerRef.current = null;
          }
          if (renderWorkerRef.current) {
            renderWorkerRef.current.terminate();
            renderWorkerRef.current = null;
          }
          if (imageWorkerRef.current) {
            imageWorkerRef.current.terminate();
            imageWorkerRef.current = null;
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
        console.log('[PDFWrite] Render: falling back to main thread (no worker)');
        // Fallback to main thread rendering
        return convertChunkToImagesMainThread(dataUri, pageNumbers)
          .then(resolve)
          .catch(reject);
      }

      console.log('[PDFWrite] Render: using worker');
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
          console.log('[PDFWrite] Render worker: success');
          resolve(images);
        } else if (type === 'ERROR') {
          renderWorkerRef.current?.removeEventListener('message', handleMessage);
          renderWorkerRef.current?.removeEventListener('error', handleErrorEvent);
          // Fallback to main thread on worker-reported error
          console.warn('[PDFWrite] Render worker: reported error, falling back to main thread:', error);
          convertChunkToImagesMainThread(dataUri, pageNumbers).then(resolve).catch(reject);
        }
      };

      const handleErrorEvent = () => {
        renderWorkerRef.current?.removeEventListener('message', handleMessage);
        renderWorkerRef.current?.removeEventListener('error', handleErrorEvent);
        // Fallback to main thread on worker load/runtime error
        console.warn('[PDFWrite] Render worker: runtime/load error, falling back to main thread');
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

  const processPdfPages = useCallback(async (rangeToProcess?: string) => {
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

  const processImages = useCallback(async (rangeToProcess?: string, images?: string[], count?: number) => {
    console.log('[Processing Images] Starting...');
    const uris = images || imageDataUris;
    const totalCount = count || pageCount;
    console.log('[Processing Images] URIs length:', uris.length, 'Total count:', totalCount);

    if (generationCount !== null && generationCount >= MAX_PDF_GENERATIONS) {
      toast({
        variant: 'destructive',
        title: 'Generation Limit Reached',
        description: `You have reached the maximum of ${MAX_PDF_GENERATIONS} image generations.`,
      });
      return;
    }
  
    cancelRef.current = false;
    setStep('processing');
    setIsProcessing(true);
    updateProcessingState({ 
      currentImage: null, 
      currentPage: null, 
      message: 'Starting image processing...' 
    });

    try {
      const imagesToProcess = parsePageRange(rangeToProcess || '1', totalCount);
      if (!imagesToProcess) {
        toast({
          variant: 'destructive',
          title: 'Invalid Image Range',
          description: `You can only process up to ${MAX_PAGES_ALLOWED} images at a time.`,
        });
        resetProcessing();
        setStep('select-page');
        return;
      }
      
      const totalImages = imagesToProcess.length;
      let allFormattedText = '';
      let processedCount = 0;

      updateProcessingState({ message: 'Compressing images...' });
      
      for (let i = 0; i < totalImages; i += CHUNK_SIZE) {
        if (cancelRef.current) {
          resetProcessing();
          toast({
            title: 'Processing Cancelled',
            description: allFormattedText.trim() 
              ? `Kept ${processedCount} of ${totalImages} processed images.`
              : 'No images were processed.',
          });
          setStep(allFormattedText.trim() ? 'edit' : 'select-page');
          return;
        }

        const chunkIndices = imagesToProcess.slice(i, Math.min(i + CHUNK_SIZE, totalImages));
        const chunkImageUris = chunkIndices.map(index => uris[index - 1]);

        updateProcessingState({ 
          message: `Compressing images ${chunkIndices[0]}-${chunkIndices[chunkIndices.length - 1]}...` 
        });

        const chunkImages = await Promise.all(chunkImageUris.map(uri => {
          return new Promise<string>((resolve, reject) => {
            if (!imageWorkerRef.current) {
              // No fallback for image compression, just resolve the original image
              resolve(uri.split(',')[1]);
              return;
            }
            const handleMessage = (e: MessageEvent) => {
              if (e.data.type === 'SUCCESS') {
                imageWorkerRef.current?.removeEventListener('message', handleMessage);
                resolve(e.data.compressedImage);
              } else if (e.data.type === 'ERROR') {
                imageWorkerRef.current?.removeEventListener('message', handleMessage);
                reject(new Error(e.data.error));
              }
            };
            imageWorkerRef.current.addEventListener('message', handleMessage);
            imageWorkerRef.current.postMessage({ type: 'COMPRESS_IMAGE', data: { imageDataUri: uri } });
          });
        }));

        if (cancelRef.current) {
          resetProcessing();
          toast({
            title: 'Processing Cancelled',
            description: allFormattedText.trim() 
              ? `Kept ${processedCount} of ${totalImages} processed images.`
              : 'No images were processed.',
          });
          setStep(allFormattedText.trim() ? 'edit' : 'select-page');
          return;
        }

        updateProcessingState({ 
          message: `Processing images ${chunkIndices[0]}-${chunkIndices[chunkIndices.length - 1]} of ${totalImages}...` 
        });

        console.log('[Processing Images] Calling AI...');
        let results;
        try {
          results = await extractAndFormatPages({ images: chunkImages, pageNumbers: chunkIndices });
        } catch (error) {
          const rawError = error instanceof Error ? error.message : 'AI processing failed';
          handleProcessingError(rawError, processedCount, totalImages, allFormattedText.trim().length > 0, allFormattedText);
          return;
        }

        if (cancelRef.current) {
          resetProcessing();
          toast({
            title: 'Processing Cancelled',
            description: allFormattedText.trim() 
              ? `Kept ${processedCount} of ${totalImages} processed images.`
              : 'No images were processed.',
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
            updateProcessingState({ message: `Completed ${processedCount} of ${totalImages} images...` });
          } else if (!result.success) {
            const errorMsg = result.error?.toLowerCase() || '';
            const isCriticalError = ['rate limit', 'quota', 'api', 'limit exceeded']
              .some(pattern => errorMsg.includes(pattern));
            
            if (isCriticalError) {
              handleProcessingError(
                result.error || 'Unknown error', 
                processedCount, 
                totalImages, 
                allFormattedText.trim().length > 0,
                allFormattedText
              );
              return;
            } else {
              toast({
                title: 'Image Processing Warning',
                description: `Image ${result.pageNumber}: ${getUserFriendlyError(result.error || 'Unknown error')}`,
                duration: 5000,
              });
            }
          }
        }

        chunkImages.length = 0;
        updateProcessingState({ currentImage: null, currentPage: null });
        
        if (typeof global !== 'undefined' && global.gc) global.gc();
      }

      if (!allFormattedText.trim()) throw new Error('Failed to extract any text from the selected image(s).');

      updateProcessingState({ message: `Successfully processed ${processedCount} of ${totalImages} images!` });
      await incrementGenerationCount();
      resetProcessing();

    } catch (error) {
      resetProcessing();
      
      if (error instanceof Error && error.message === 'Processing cancelled by user') {
        toast({
          title: 'Processing Cancelled',
          description: editedText.trim() ? 'Kept processed content.' : 'No images were processed.',
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
  }, [imageDataUris, pageCount, editedText, toast, getUserFriendlyError, handleProcessingError, resetProcessing, updateProcessingState]);

  const startProcessing = useCallback(async (rangeToProcess?: string, fileTypeOverride?: 'pdf' | 'image', images?: string[], count?: number) => {
    const type = fileTypeOverride || fileType;
    console.log('[Processing] Starting processing with fileType:', type);
    if (type === 'pdf') {
      await processPdfPages(rangeToProcess);
    } else if (type === 'image') {
      await processImages(rangeToProcess, images, count);
    }
  }, [fileType, processPdfPages, processImages]);

  const handleCancelProcessing = useCallback(() => {
    cancelRef.current = true;
    updateProcessingState({ message: 'Cancelling processing...' });
  }, [updateProcessingState]);

  // Convert ArrayBuffer to Base64 using Web Worker
  const convertToBase64WithWorker = useCallback((arrayBuffer: ArrayBuffer): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!base64WorkerRef.current) {
        console.log('[PDFWrite] Base64: falling back to main thread (no worker)');
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

      console.log('[PDFWrite] Base64: using worker');
      const handleMessage = (e: MessageEvent) => {
        const { type, dataUri, error, progress } = e.data;
        
        if (type === 'PROGRESS') {
          updateProcessingState({ message: `Preparing PDF... ${progress}%` });
        } else if (type === 'SUCCESS') {
          base64WorkerRef.current?.removeEventListener('message', handleMessage);
          console.log('[PDFWrite] Base64 worker: success');
          resolve(dataUri);
        } else if (type === 'ERROR') {
          base64WorkerRef.current?.removeEventListener('message', handleMessage);
          console.warn('[PDFWrite] Base64 worker: reported error');
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

  const handlePdfFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStep('processing');
    updateProcessingState({ message: 'Reading PDF file...' });

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        
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
          await startProcessing('1');
        }
      } catch (error) {
        console.error('PDF Loading Error:', error);
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
      console.error('FileReader error:', reader.error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Failed to read the file. The file may be corrupted or too large.',
      });
      handleReset();
    };
  }, [toast, startProcessing, getUserFriendlyError, updateProcessingState, convertToBase64WithWorker]);

  const handleImageFiles = useCallback(async (files: FileList) => {
    setFileName(files.length > 1 ? `${files.length} images` : files[0].name);
    setStep('processing');
    updateProcessingState({ message: 'Reading image files...' });

    console.log('[Image Upload] Reading files...');
    const fileArray = Array.from(files);
    const dataUris: string[] = [];

    try {
      await Promise.all(fileArray.map(file => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              dataUris.push(e.target.result as string);
              resolve();
            } else {
              reject(new Error('Failed to read file result.'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }));

      console.log('[Image Upload] Files read, dataUris length:', dataUris.length);

      setImageDataUris(dataUris);
      setPageCount(dataUris.length);

      if (dataUris.length > 1) {
        setPageRange(`1-${dataUris.length}`);
        setStep('select-page');
        updateProcessingState({ message: '' });
      } else {
        console.log('[Image Upload] Starting single image processing...');
        await startProcessing('1', 'image', dataUris, dataUris.length);
      }
    } catch (error) {
      console.error('Image Loading Error:', error);
      toast({
        variant: 'destructive',
        title: 'Image Loading Failed',
        description: 'Could not read the image files.',
        duration: 6000,
      });
      handleReset();
    }
  }, [toast, startProcessing, updateProcessingState]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (generationCount !== null && generationCount >= MAX_PDF_GENERATIONS) {
      toast({
        variant: 'destructive',
        title: 'Generation Limit Reached',
        description: `You have reached the maximum of ${MAX_PDF_GENERATIONS} generations.`,
      });
      return;
    }

    console.log('[File Select] Files:', files);
    if (!files || files.length === 0) {
      console.log('[File Select] No files selected.');
      return;
    }

    const firstFile = files[0];
    console.log('[File Select] First file type:', firstFile.type);

    if (firstFile.type === 'application/pdf') {
      if (files.length > 1) {
        toast({
          variant: 'destructive',
          title: 'Invalid Selection',
          description: 'Please upload one PDF at a time.',
        });
        return;
      }
      setFileType('pdf');
      handlePdfFile(firstFile);
    } else if (firstFile.type.startsWith('image/')) {
      setFileType('image');
      handleImageFiles(files);
    } else {
      console.log('[File Select] Invalid file type.');
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF or image files.',
      });
    }
  }, [toast, handlePdfFile, handleImageFiles, generationCount]);

  const handleDragEvents = useCallback((isEntering: boolean) => {
    setIsDragging(isEntering);
  }, []);

  const handleReset = useCallback(() => {
    cancelRef.current = false;
    setStep('upload');
    setEditedText('');
    setEditedMarkdown('');
    setFileName('');
    setFileType(null);
    setPdfDataUri(null);
    setImageDataUris([]);
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
    startProcessing,
    handleFileSelect,
    handleDragEvents,
    handleReset,
    handleCancelProcessing,
  }), [
    step, setStep, editedText, editedMarkdown, fileName, isDragging, pageCount, pageRange,
    processingState, isProcessing, startProcessing, handleFileSelect,
    handleDragEvents, handleReset, handleCancelProcessing
  ]);
}