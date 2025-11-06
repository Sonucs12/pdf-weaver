'use client';

import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  showText?: boolean;
  disabled?: boolean;
}

export function BackButton({ showText = true, className, disabled, ...props }: BackButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 group',
        className
      )}
      disabled={disabled}
      {...props}
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      {showText && <span>Back</span>}
    </button>
  );
}
