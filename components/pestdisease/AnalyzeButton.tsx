'use client';

import { Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyzeButtonProps {
  onAnalyze: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function AnalyzeButton({ onAnalyze, loading, disabled }: AnalyzeButtonProps) {
  return (
    <Button
      onClick={onAnalyze}
      disabled={disabled || loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Analyzing Image...
        </>
      ) : (
        <>
          <ImageIcon className="w-4 h-4 mr-2" />
          Analyze for Pests & Diseases
        </>
      )}
    </Button>
  );
}