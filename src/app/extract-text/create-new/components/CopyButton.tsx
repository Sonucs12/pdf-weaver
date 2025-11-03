'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  textToCopy: string;
  disabled?: boolean;
}

export function CopyButton({ textToCopy, className, disabled, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Button
      variant="outline"
      onClick={copyToClipboard}
      className={cn('relative', className)}
      disabled={disabled || hasCopied}
      {...props}
    >
      {hasCopied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </>
      )}
    </Button>
  );
}
