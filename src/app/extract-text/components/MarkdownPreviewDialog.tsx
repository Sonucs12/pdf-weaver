'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { markdownToHtml } from '@/hooks/use-markdown-to-html';
import { SyntaxHighlighter } from '@/components/syntax-highlighter';


interface MarkdownPreviewDialogProps {
  markdown: string;
  title?: string;
  triggerLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MarkdownPreviewDialog({ markdown, title = 'Preview', triggerLabel = 'Preview', size = 'lg' }: MarkdownPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'html' | 'markdown'>('html');

  const html = useMemo(() => markdownToHtml(markdown || ''), [markdown]);

  const handleCopy = async () => {
    const textToCopy = mode === 'html' ? html : markdown;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {}
  };

  const contentClass = size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-2xl' : 'max-w-4xl';


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className={`${contentClass} w-full`}> 
        <DialogHeader>
          <DialogTitle className='flex justify-between items-center'>{title} <div className="flex items-center justify-between gap-2">
          <div className="flex ml-4 justify-end">
            <Button className='rounded-r-none ' size="sm" variant={mode === 'html' ? 'default' : 'outline'}  onClick={() => setMode('html')}>HTML</Button>
            <Button  className='rounded-l-none' variant={mode === 'markdown' ? 'default' : 'outline'} size="sm" onClick={() => setMode('markdown')}>Markdown</Button>
          </div>
          <Button size="sm" onClick={handleCopy}>Copy</Button>
        </div></DialogTitle>
        </DialogHeader>
        
        <div>
          <SyntaxHighlighter
            language={mode === 'html' ? 'markup' : 'markdown'}
           code={mode === 'html' ? html : markdown}
          />
           
          
        </div>
      </DialogContent>
    </Dialog>
  );
}


