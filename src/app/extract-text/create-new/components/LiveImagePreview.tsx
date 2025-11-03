
import { Loader2 } from 'lucide-react';

interface LiveImagePreviewProps {
  currentImage: string | null;
  currentPage: number | null;
  progressMessage: string;
}

export function LiveImagePreview({
  currentImage,
  currentPage,
  progressMessage,
}: LiveImagePreviewProps) {
  if (!currentImage) return null;

  return (
    <div className="p-6 mt-6 max-w-md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <h3 className="font-semibold text-sm">Processing Page {currentPage}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {progressMessage}
          </p>
        </div>

        {/* Live Image Preview */}
        <div className="relative rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <img
            src={currentImage}
            alt={`Processing page ${currentPage}`}
            className="w-full h-auto  object-contain"
          />
          
        </div>

        {/* Info Text */}
        <p className="text-sm text-center text-muted-foreground">
          AI is analyzing this page and extracting formatted text...
        </p>
      </div>
    </div>
  );
}