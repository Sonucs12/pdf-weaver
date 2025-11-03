'use client';

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { extractAndFormatPages, formatContent } from '@/ai/flows';
import { parsePageRange } from '@/lib/utils/pdf-utils';
import type { Step } from '@/app/extract-text/create-new/components/types';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check if PDF has text content (digital) or needs OCR (scanned)
  const checkPdfType = useCallback(async (dataUri: string): Promise<'digital' | 'scanned'> => {
    try {
      const loadingTask = pdfjsLib.getDocument(dataUri);
      const pdf = await loadingTask.promise;
      
      // Check first page for text content
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      
      // If first page has substantial text, it's likely digital
      const hasText = textContent.items.length > 10;
      
      return hasText ? 'digital' : 'scanned';
    } catch (error) {
      console.error('Error checking PDF type:', error);
      return 'scanned'; // Default to scanned if check fails
    }
  }, []);

  // Extract text from a CHUNK of pages (digital PDF)
  const extractTextChunk = useCallback(async (
    dataUri: string,
    pageNumbers: number[]
  ): Promise<{ pageNumber: number; text: string }[]> => {
    const loadingTask = pdfjsLib.getDocument(dataUri);
    const pdf = await loadingTask.promise;
    
    const results: { pageNumber: number; text: string }[] = [];

    for (const pageNum of pageNumbers) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      
      results.push({ pageNumber: pageNum, text: pageText });
    }

    return results;
  }, []);

  // Convert a CHUNK of pages to images (scanned PDF)
  const convertChunkToImages = useCallback(async (
    dataUri: string,
    pageNumbers: number[]
  ): Promise<string[]> => {
    const loadingTask = pdfjsLib.getDocument(dataUri);
    const pdf = await loadingTask.promise;
    const images: string[] = [];

    for (const pageNum of pageNumbers) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      await page.render({ canvasContext: context, viewport }).promise;

      const base64 = canvas.toDataURL('image/jpeg', 0.75);
      images.push(base64.split(',')[1]);
      
      // Cleanup canvas immediately
      canvas.width = 0;
      canvas.height = 0;
    }

    return images;
  }, []);

  const processPdf = useCallback(async (rangeToProcess?: string) => {
    if (!pdfDataUri) return;
  
    setStep('processing');
    setProgressMessage('Analyzing PDF...');
    setIsProcessing(true);

    try {
      const pagesToProcess = parsePageRange(rangeToProcess || '1', pageCount);
      if (!pagesToProcess) {
        throw new Error('Invalid page range provided.');
      }

      // Check if PDF is digital or scanned
      setProgressMessage('Detecting PDF type...');
      const pdfType = await checkPdfType(pdfDataUri);
      
      const totalPages = pagesToProcess.length;
      const CHUNK_SIZE = 2; // Process 2 pages at a time
      let allFormattedText = '';
      let processedCount = 0;

      if (pdfType === 'digital') {
        // FAST PATH: Extract text chunk-by-chunk
        setProgressMessage('Digital PDF detected - extracting text...');
        
        for (let i = 0; i < totalPages; i += CHUNK_SIZE) {
          const chunk = pagesToProcess.slice(i, Math.min(i + CHUNK_SIZE, totalPages));
          
          setProgressMessage(
            `Extracting text from pages ${chunk[0]}-${chunk[chunk.length - 1]} of ${totalPages}...`
          );

          // Extract text for this chunk only
          const textChunk = await extractTextChunk(pdfDataUri, chunk);
          
          setProgressMessage(
            `Formatting pages ${chunk[0]}-${chunk[chunk.length - 1]} of ${totalPages}...`
          );

          // Format each page in parallel
          const formatPromises = textChunk.map(async ({ pageNumber, text }) => {
            if (!text.trim()) {
              return {
                success: false,
                formattedText: '',
                pageNumber
              };
            }

            try {
              const { formattedText } = await formatContent({ text });
              return {
                success: true,
                formattedText: formattedText || '',
                pageNumber
              };
            } catch (error) {
              return {
                success: false,
                formattedText: '',
                pageNumber,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          });

          const results = await Promise.all(formatPromises);

          // Accumulate and cleanup
          for (const result of results) {
            if (result.success && result.formattedText?.trim()) {
              const separator = allFormattedText ? '\n\n---\n\n' : '';
              allFormattedText += separator + result.formattedText.trim();
              
              setEditedText(allFormattedText);
              
              if (processedCount === 0) {
                setStep('edit');
              }
              
              processedCount++;
              
              setProgressMessage(
                `Completed ${processedCount} of ${totalPages} pages...`
              );
            } else if (!result.success && result.error) {
              toast({
                title: 'Page Processing Warning',
                description: `Page ${result.pageNumber}: ${result.error}`,
              });
            }
          }
          
          // Trigger garbage collection hint
          if (typeof global !== 'undefined' && global.gc) {
            global.gc();
          }
        }
      } else {
        // SLOW PATH: Convert chunk-by-chunk (memory optimized)
        setProgressMessage('Scanned PDF detected - processing with OCR...');
        
        for (let i = 0; i < totalPages; i += CHUNK_SIZE) {
          const chunk = pagesToProcess.slice(i, Math.min(i + CHUNK_SIZE, totalPages));

          setProgressMessage(
            `Converting pages ${chunk[0]}-${chunk[chunk.length - 1]} to images...`
          );

          // Convert only this chunk to images
          const chunkImages = await convertChunkToImages(pdfDataUri, chunk);

          setProgressMessage(
            `Processing pages ${chunk[0]}-${chunk[chunk.length - 1]} of ${totalPages}...`
          );

          // Send chunk to AI
          const results = await extractAndFormatPages({
            images: chunkImages,
            pageNumbers: chunk,
          });

          // Accumulate results and cleanup
          for (const result of results) {
            if (result.success && result.formattedText?.trim()) {
              const separator = allFormattedText ? '\n\n---\n\n' : '';
              allFormattedText += separator + result.formattedText.trim();
              
              setEditedText(allFormattedText);
              
              if (processedCount === 0) {
                setStep('edit');
              }
              
              processedCount++;
              
              setProgressMessage(
                `Completed ${processedCount} of ${totalPages} pages...`
              );
            } else if (!result.success) {
              console.warn(`Page ${result.pageNumber} failed:`, result.error);
              toast({
                title: 'Page Processing Warning',
                description: `Page ${result.pageNumber}: ${result.error}`,
              });
            }
          }

          // Clear chunk images from memory
          chunkImages.length = 0;
          
          // Trigger garbage collection hint
          if (typeof global !== 'undefined' && global.gc) {
            global.gc();
          }
        }
      }

      if (!allFormattedText.trim()) {
        throw new Error('Failed to extract any text from the selected page(s).');
      }

      setProgressMessage(`Successfully processed ${processedCount} of ${totalPages} pages!`);
      setIsProcessing(false);

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      handleReset();
    }
  }, [pdfDataUri, toast, pageCount, checkPdfType, extractTextChunk, convertChunkToImages]);

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
    reader.readAsArrayBuffer(file);
    
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        
        // Convert to Uint8Array immediately (before it gets detached)
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to base64 immediately
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        const dataUri = `data:application/pdf;base64,${base64}`;
        
        setProgressMessage('Loading PDF...');
        
        // Use pdfjs to get page count
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
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'PDF Loading Failed',
          description: 'Could not read the PDF file. Please try another file.',
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
    setIsProcessing(false);
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
    isProcessing,
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