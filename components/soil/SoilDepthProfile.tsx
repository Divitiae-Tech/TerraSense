// components/soil/soil-depth-profile.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DepthProfileProps {
  properties: any;
  depthLayers: string[];
}

export const SoilDepthProfile: React.FC<DepthProfileProps> = ({ properties, depthLayers }) => {
  const propertiesToDisplay = ['sand', 'clay', 'silt', 'bdod', 'phh2o', 'soc'];
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-indigo-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-5 12a1 1 0 11-1.898-.632l5-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
          Soil Depth Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depth Layer
                </th>
                {propertiesToDisplay.map(prop => (
                  <th key={prop} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {prop.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {depthLayers.map(depth => (
                <tr key={depth} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {depth}
                  </td>
                  {propertiesToDisplay.map(prop => {
                    const data = properties[prop]?.[depth];
                    return (
                      <td key={`${prop}-${depth}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {data ? (
                          <Badge variant="secondary">
                            {data.value?.toFixed(2) || 'N/A'}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};