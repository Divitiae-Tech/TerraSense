// components/soil/environmental-context.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnvironmentalProps {
  environmental: any;
}

export const EnvironmentalContext: React.FC<EnvironmentalProps> = ({ environmental }) => {
  if (!environmental) return null;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-purple-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </span>
          Environmental Context
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Climate</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Zone:</span>
              <span className="font-medium">{environmental.climate?.zone}</span>
            </div>
            <div className="flex justify-between">
              <span>Rainfall:</span>
              <span className="font-medium">{environmental.climate?.averageRainfall} mm/year</span>
            </div>
            <div className="flex justify-between">
              <span>Rainy Season:</span>
              <span className="font-medium">{environmental.climate?.rainySeasonMonths?.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span className="font-medium">{environmental.climate?.temperatureRange?.min}°C to {environmental.climate?.temperatureRange?.max}°C</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Topography</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Elevation:</span>
              <span className="font-medium">{environmental.topography?.elevation} m</span>
            </div>
            <div className="flex justify-between">
              <span>Slope:</span>
              <span className="font-medium">{environmental.topography?.slope}</span>
            </div>
            <div className="flex justify-between">
              <span>Drainage:</span>
              <span className="font-medium">{environmental.topography?.drainageClass}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Hydrology</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Watershed:</span>
              <span className="font-medium">{environmental.hydrology?.watershedPosition}</span>
            </div>
            <div className="flex justify-between">
              <span>Flooding Risk:</span>
              <span className="font-medium">{environmental.hydrology?.floodingRisk}</span>
            </div>
            <div className="flex justify-between">
              <span>Groundwater:</span>
              <span className="font-medium">{environmental.hydrology?.groundwaterDepth}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Ecology</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Biome:</span>
              <span className="font-medium">{environmental.ecology?.biome}</span>
            </div>
            <div className="flex justify-between">
              <span>Ecoregion:</span>
              <span className="font-medium">{environmental.ecology?.ecoregion}</span>
            </div>
            <div className="flex justify-between">
              <span>Vegetation:</span>
              <span className="font-medium">{environmental.ecology?.naturalVegetation}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};