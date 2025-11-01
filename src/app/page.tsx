'use client';

import { useState, useCallback, useRef, type ChangeEvent, type DragEvent } from 'react';
import { extractTextFromPdf, formatContent } from '@/ai/flows';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Download, Loader2, RefreshCw } from 'lucide-react';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';

type Step = 'upload' | 'processing' | 'edit';

const AppHeader = () => (
  <header className="py-4 px-4 md:px-8 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
    <div className="flex items-center gap-3">
      <Logo className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-headline font-bold text-foreground">PDF Weaver</h1>
    </div>
  </header>
);

export default function PdfWeaverPage() {
  const [step, setStep] = useState<Step>('upload');
  const [editedText, setEditedText] =useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    setStep('processing');
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const pdfDataUri = reader.result as string;

        const { extractedText } = await extractTextFromPdf({ pdfDataUri });
        if (!extractedText) {
          throw new Error('Failed to extract text from the PDF.');
        }

        const { formattedText } = await formatContent({ text: extractedText });

        setEditedText(formattedText);
        setStep('edit');
      };
      reader.onerror = () => {
        throw new Error('Failed to read the file.');
      };
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setStep('upload');
    }
  }, [toast]);

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
    const blob = new Blob([editedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.pdf$/i, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStep('upload');
    setEditedText('');
    setFileName('');
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
      case 'processing':
        return (
          <div className="flex flex-col items-center text-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-headline font-semibold">Weaving your PDF...</h2>
            <p className="text-muted-foreground max-w-sm">
              Our AI is working its magic to extract and structure your content. This may take a moment.
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
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download .txt</Button>
              </div>
            </div>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Your formatted text will appear here..."
              className="flex-grow w-full h-full resize-none text-base leading-relaxed shadow-lg"
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 transition-opacity duration-500">
        {renderContent()}
      </main>
    </div>
  );
}
