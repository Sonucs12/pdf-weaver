'use client';

import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { parsePageRange } from '@/lib/utils/pdf-utils';

interface SelectPageStepProps {
  pageCount: number;
  pageRange: string;
  onPageRangeChange: (range: string) => void;
  onProcess: () => void;
}

export function SelectPageStep({
  pageCount,
  pageRange,
  onPageRangeChange,
  onProcess,
}: SelectPageStepProps) {
  const isValid = parsePageRange(pageRange, pageCount) !== null;

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
          onChange={(e) => onPageRangeChange(e.target.value)}
          placeholder="e.g., 5 or 2-7"
          className="text-center text-lg"
        />
        <Button 
          onClick={onProcess}
          disabled={!isValid}
        >
          Process Pages <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

