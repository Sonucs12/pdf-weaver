'use client';

import { Loader2 } from 'lucide-react';

interface ProcessingStepProps {
  progressMessage: string;
}

export function ProcessingStep({ progressMessage }: ProcessingStepProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h2 className="text-2xl font-headline font-semibold">Weaving your PDF...</h2>
      <p className="text-muted-foreground max-w-sm">
        {progressMessage || 'Our AI is working its magic to extract and structure your content. This may take a moment.'}
      </p>
    </div>
  );
}

