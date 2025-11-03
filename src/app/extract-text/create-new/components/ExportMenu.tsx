'use client';

import { DropDownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportMenuProps {
  editedText: string;
  editedMarkdown: string;
  fileName: string;
  isProcessing: boolean;
}

export function ExportMenu({ editedText, editedMarkdown, fileName, isProcessing }: ExportMenuProps) {
  const { toast } = useToast();

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
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      }
      items={menuItems}
    />
  );
}
