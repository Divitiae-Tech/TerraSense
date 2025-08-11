'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: string | null;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}