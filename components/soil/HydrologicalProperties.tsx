// components/soil/hydrological-properties.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HydrologicalProps {
  analysis: any;
}

export const HydrologicalProperties: React.FC<HydrologicalProps> = ({ analysis }) => {
  if (!analysis?.hydrological) return null;

  const { waterRetention, infiltration } = analysis.hydrological;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-blue-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
          Hydrological Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Water Retention</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Field Capacity:</span>
              <Badge variant="secondary">{waterRetention?.fieldCapacity?.toFixed(2)}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Wilting Point:</span>
              <Badge variant="secondary">{waterRetention?.wiltingPoint?.toFixed(2)}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Available Water:</span>
              <Badge variant="secondary">{waterRetention?.availableWater?.toFixed(2)}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Holding Capacity:</span>
              <Badge variant="outline">{waterRetention?.waterHoldingClass}</Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Infiltration</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Rate:</span>
              <Badge variant="secondary">{infiltration?.rate}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Runoff Risk:</span>
              <Badge variant="outline">{infiltration?.surfaceRunoffRisk}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Permeability:</span>
              <Badge variant="outline">{infiltration?.permeabilityClass}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};