'use client';

import { DropDownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHtmlToWord } from '@/hooks/use-html-to-word';
import { usePdfGenerator } from '@/hooks/use-pdfgenertor';
import { useEffect, useRef, useCallback } from 'react';

interface ExportMenuProps {
  content: {
    editedText: string;
    editedMarkdown: string;
  };
  fileName: string;
  isProcessing: boolean;
  projectTitle?: string;
}

export function ExportMenu({ 
  content: { editedText, editedMarkdown },
  fileName, 
  isProcessing, 
  projectTitle 
}: ExportMenuProps) {
  const { toast, dismiss } = useToast();
  const { convertAndDownload, isConverting } = useHtmlToWord();
  const { generatePdf, isGenerating: isGeneratingPdf, phase, error, clearError } = usePdfGenerator();
  const toastIdRef = useRef<string | undefined>();

  const getFileName = useCallback(() => {
    let name = '';
    if (projectTitle && projectTitle.trim()) {
      name = projectTitle.trim();
    } else if (fileName && fileName.trim() && fileName !== 'untitled') {
      name = fileName.replace(/\.pdf$/i, '').trim();
    } else {
      name = 'pdfwrite';
    }
    
    return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || 'pdfwrite';
  }, [projectTitle, fileName]);

  useEffect(() => {
    if (phase === 'waking') {
      toastIdRef.current = toast({
        title: 'Waking server...',
        description: 'Preparing the PDF generation service.',
        duration: 999999,
      }).id;
    } else if (phase === 'generating') {
      if (toastIdRef.current) {
        dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast({
        title: 'Generating PDF...',
        description: 'Your PDF is being created.',
        duration: 999999,
      }).id;
    } else if (phase === 'idle' && toastIdRef.current) {
      dismiss(toastIdRef.current);
      toastIdRef.current = undefined;
    }
  }, [phase]);

  useEffect(() => {
    if (error) {
      if (toastIdRef.current) {
        dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
      toast({ variant: 'destructive', title: 'PDF Generation Failed', description: error });
      clearError();
    }
  }, [error]);

  const handleDownload = useCallback((format: 'html' | 'md') => {
    const content = format === 'md' ? editedMarkdown : editedText;
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getFileName()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editedMarkdown, editedText, getFileName]);

  const handleCopy = useCallback((format: 'html' | 'md') => {
    const content = format === 'md' ? editedMarkdown : editedText;
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!' });
  }, [editedMarkdown, editedText, toast]);

  const handleDocxDownload = useCallback(async () => {
    try {
      await convertAndDownload(editedText, getFileName());
    } catch (e) {
      toast({ variant: 'destructive', title: 'DOCX download failed' });
    }
  }, [editedText, getFileName, convertAndDownload, toast]);

const handlePdfDownload = useCallback(async () => {
  try {
    await generatePdf(editedMarkdown, {
      filename: `${getFileName()}.pdf`,
    });
    
    if (toastIdRef.current) {
      dismiss(toastIdRef.current);
      toastIdRef.current = undefined;
    }
    
    toast({ title: 'PDF Downloaded Successfully!' });
  } catch (e) {

  }
}, [editedMarkdown, getFileName, generatePdf, toast, dismiss]);

  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Download as HTML',
      icon: <Download className="h-4 w-4" />,
      onClick: () => handleDownload('html'),
      disabled: isProcessing,
    },
    {
      label: 'Download as Markdown',
      icon: <Download className="h-4 w-4" />,
      onClick: () => handleDownload('md'),
      disabled: isProcessing,
    },
    {
      label: 'Download as DOCX',
      icon: <Download className="h-4 w-4" />,
      onClick: handleDocxDownload,
      disabled: isProcessing || isConverting,
    },
    {
      label:
        phase === 'waking'
          ? 'Waking server...'
          : phase === 'generating'
          ? 'Generating PDF...'
          : 'Download as PDF',
      icon: <Download className="h-4 w-4" />,
      onClick: handlePdfDownload,
      disabled: isProcessing || isGeneratingPdf,
    },
    {
      label: 'Copy as HTML',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => handleCopy('html'),
      disabled: isProcessing,
    },
    {
      label: 'Copy as Markdown',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => handleCopy('md'),
      disabled: isProcessing,
    },
  ];

  return (
    <DropDownMenu
      trigger={
        <Button variant="outline" disabled={isProcessing}>
          Export
        </Button>
      }
      items={menuItems}
      portal={true}
    />
  );
}