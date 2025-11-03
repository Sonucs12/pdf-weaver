import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface CancelButtonProps {
  onCancel: () => void;
  isProcessing: boolean;
}

export function CancelButton({ onCancel, isProcessing }: CancelButtonProps) {
  if (!isProcessing) return null;

  return (
    
      <Button
        variant="destructive"
        size="lg"
        onClick={onCancel}
       
      >
        <XCircle className="h-5 w-5" />
        Cancel Processing
      </Button>
    
  );
}