// components/soil/soil-classification.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClassificationProps {
  classification: any;
}

export const SoilClassification: React.FC<ClassificationProps> = ({ classification }) => {
  if (!classification) return null;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-green-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          </span>
          Soil Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Textural Classification</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Primary Class:</span>
              <Badge variant="secondary">{classification.textural?.primaryClass}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Workability:</span>
              <Badge variant="outline">{classification.textural?.workability}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Drought Susceptibility:</span>
              <Badge variant="outline">{classification.textural?.droughtSusceptibility}</Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Fertility Rating</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Overall Rating:</span>
              <Badge variant="secondary">{classification.fertility?.overallRating}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Limiting Factors:</span>
              <Badge variant="outline">
                {classification.fertility?.limitingFactors?.join(', ') || 'None'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Management Needs:</span>
              <Badge variant="outline">
                {classification.fertility?.managementNeeds?.join(', ') || 'None'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};