'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImagePreviewProps {
  previewUrl: string | null;
}

export default function ImagePreview({ previewUrl }: ImagePreviewProps) {
  if (!previewUrl) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}