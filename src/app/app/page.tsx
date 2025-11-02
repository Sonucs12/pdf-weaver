
'use client';

import { useState, useCallback, useRef, type ChangeEvent, type DragEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { extractTextFromPdfSupabase, formatContent } from '@/ai/flows';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Set worker source for pdfjs
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

type Step = 'upload' | 'select-page' | 'processing' | 'edit';

const MarkdownPreview = ({ markdown }: { markdown: string }) => (
  <div className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-background/50 h-full overflow-y-auto">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
  </div>
);

export default function PdfWeaverPage() {
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

  const parsePageRange = (range: string, max: number): number[] | null => {
    if (!range.trim()) return null;

    const parts = range.split('-').map(s => s.trim());
    
    if (parts.length === 1) {
      const page = parseInt(parts[0], 10);
      if (isNaN(page) || page < 1 || page > max) return null;
      return [page];
    }
    
    if (parts.length === 2) {
      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end > max || start > end) return null;
      
      const pages: number[] = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }

    return null;
  };

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
    setStep('processing'); // Show loading state early
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

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    setIsDragging(isEntering);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([editedText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.pdf$/i, '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
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
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <Card 
            className="w-full max-w-lg text-center shadow-lg transition-all duration-300"
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Upload Your PDF</CardTitle>
              <CardDescription>Drag and drop your file or click to select.</CardDescription>
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
                  {isDragging ? 'Drop it like it\'s hot!' : 'Click or drag a PDF file here'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        );
      case 'select-page':
        return (
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Select Page(s)</CardTitle>
              <CardDescription>
                Your PDF has {pageCount} pages. Enter a page or range (e.g., 1-5).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g., 5 or 2-7"
                className="text-center text-lg"
              />
              <Button 
                onClick={() => processPdf(pageRange)}
                disabled={!parsePageRange(pageRange, pageCount)}
              >
                Process Pages <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center text-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-headline font-semibold">Weaving your PDF...</h2>
            <p className="text-muted-foreground max-w-sm">
              {progressMessage || 'Our AI is working its magic to extract and structure your content. This may take a moment.'}
            </p>
          </div>
        );
      case 'edit':
        return (
          <div className="w-full max-w-4xl h-[75vh] flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium truncate">{fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset}><RefreshCw className="mr-2 h-4 w-4" />Start Over</Button>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download .md</Button>
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
                  onChange={(e) => setEditedText(e.target.value)}
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
  };

  return (
    <div className="flex-grow flex mb-8 items-center justify-center p-4 md:p-8 transition-opacity duration-500">
      {renderContent()}
    </div>
  );
}
