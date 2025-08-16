'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import FieldMap with no SSR to avoid window/document issues
const FieldMap = dynamic(() => import('./FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default FieldMap;
