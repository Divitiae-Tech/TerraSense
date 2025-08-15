// components/soil/agricultural-suitability.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SuitabilityProps {
  suitability: any;
}

export const AgriculturalSuitability: React.FC<SuitabilityProps> = ({ suitability }) => {
  if (!suitability) return null;

  const crops = ['maize', 'wheat', 'soybeans', 'vegetables', 'pasture', 'forestry'];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-yellow-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </span>
          Agricultural Suitability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Crop Suitability</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {crops.map(crop => (
                <Card key={crop} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium capitalize">{crop}</h4>
                      <Badge 
                        variant={
                          suitability.cropSuitability?.[crop]?.overall === 'suitable' ? 'default' :
                          suitability.cropSuitability?.[crop]?.overall === 'moderately suitable' ? 'secondary' : 'destructive'
                        }
                      >
                        {suitability.cropSuitability?.[crop]?.overall || 'N/A'}
                      </Badge>
                    </div>
                    {suitability.cropSuitability?.[crop]?.limitations?.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Limitations: {suitability.cropSuitability[crop].limitations.join(', ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Land Use Capability</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Class:</span>
                  <Badge variant="secondary">{suitability.landUseCapability?.class}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Limitations:</span>
                  <Badge variant="outline">
                    {suitability.landUseCapability?.limitations?.join(', ') || 'None'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Intensification:</span>
                  <Badge variant="outline">{suitability.landUseCapability?.intensificationPotential}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};