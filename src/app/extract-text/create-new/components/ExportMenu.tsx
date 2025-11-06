'use client';

import { DropDownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHtmlToWord } from '@/hooks/use-html-to-word';

interface ExportMenuProps {
  editedText: string;
  editedMarkdown: string;
  fileName: string;
  isProcessing: boolean;
}

export function ExportMenu({ editedText, editedMarkdown, fileName, isProcessing }: ExportMenuProps) {
  const { toast } = useToast();
  const { convertAndDownload, copyToClipboard, isConverting } = useHtmlToWord();

  const handleDownload = (format: 'html' | 'md') => {
    const content = format === 'md' ? editedMarkdown : editedText;
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.pdf$/i, '')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (format: 'html' | 'md') => {
    const content = format === 'md' ? editedMarkdown : editedText;
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!' });
  };

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
      onClick: async () => {
        try {
          const base = fileName.replace(/\.pdf$/i, '');
          await convertAndDownload(editedText, base);
        } catch (e) {
          toast({ variant: 'destructive', title: 'DOCX download failed' });
        }
      },
      disabled: isProcessing || isConverting,
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
  
    {
      label: 'Copy as DOCX',
      icon: <Copy className="h-4 w-4" />,
      onClick: async () => {
        try {
          await copyToClipboard(editedText, fileName.replace(/\.pdf$/i, ''));
          toast({ title: 'DOCX copied to clipboard!' });
        } catch (e) {
          toast({ variant: 'destructive', title: 'Copy failed', description: 'Your browser may not allow copying files to the clipboard.' });
        }
      },
      disabled: isProcessing || isConverting,
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
