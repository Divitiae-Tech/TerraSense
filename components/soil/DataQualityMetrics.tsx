// components/soil/data-quality-metrics.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QualityProps {
  dataQuality: any;
  metadata: any;
}

export const DataQualityMetrics: React.FC<QualityProps> = ({ dataQuality, metadata }) => {
  if (!dataQuality) return null;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-red-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </span>
          Data Quality Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Completeness</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Completeness Score:</span>
              <Badge variant="secondary">
                {(dataQuality.completeness * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Data Reliability:</span>
              <Badge variant="outline">{dataQuality.dataReliability}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Missing Properties:</span>
              <Badge variant="secondary">{dataQuality.missingProperties?.length || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Points:</span>
              <Badge variant="secondary">{dataQuality.totalDataPoints}/{dataQuality.expectedDataPoints}</Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Recommendations</h3>
          <ul className="space-y-2">
            {dataQuality.recommendations?.slice(0, 3).map((rec: string, i: number) => (
              <li key={i} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};