// components/soil/soil-properties-overview.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Thermometer, Droplets, Zap, Leaf } from 'lucide-react';

interface SoilPropertiesOverviewProps {
  properties: Record<string, Record<string, any>>;
  metadata: Record<string, any>;
}

export function SoilPropertiesOverview({ properties, metadata }: SoilPropertiesOverviewProps) {
  const getPropertyIcon = (property: string) => {
    switch (property.toLowerCase()) {
      case 'phh2o':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'soc':
        return <Leaf className="h-4 w-4 text-green-500" />;
      case 'clay':
      case 'sand':
      case 'silt':
        return <Thermometer className="h-4 w-4 text-orange-500" />;
      case 'bdod':
        return <Droplets className="h-4 w-4 text-blue-500" />;
      default:
        return <Thermometer className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPropertyDisplayName = (property: string) => {
    const displayNames: Record<string, string> = {
      'phh2o': 'pH (H₂O)',
      'soc': 'Soil Organic Carbon',
      'clay': 'Clay Content',
      'sand': 'Sand Content',
      'silt': 'Silt Content',
      'bdod': 'Bulk Density',
      'nitrogen': 'Total Nitrogen',
      'phosphorus': 'Available Phosphorus',
      'potassium': 'Available Potassium',
      'calcium': 'Available Calcium',
      'magnesium': 'Available Magnesium'
    };
    return displayNames[property] || property.charAt(0).toUpperCase() + property.slice(1);
  };

  const getPropertyValue = (property: string, depth: string) => {
    const data = properties[property]?.[depth];
    if (!data) return null;
    
    const value = data.scaledValue || data.value;
    const unit = data.unit || metadata[property]?.units || '';
    
    return { value, unit };
  };

  const topSoilProperties = Object.keys(properties).slice(0, 8);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Key Soil Properties
        </CardTitle>
        <CardDescription>
          Top soil layer (0-5cm) measurements for primary soil characteristics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {topSoilProperties.map((property) => {
            const propertyData = getPropertyValue(property, '0-5');
            const description = metadata[property]?.description || 'No description available';
            
            return (
              <div key={property} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getPropertyIcon(property)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {getPropertyDisplayName(property)}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {description.length > 60 ? description.substring(0, 60) + '...' : description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {propertyData ? (
                    <div>
                      <div className="font-bold text-lg">
                        {typeof propertyData.value === 'number' 
                          ? propertyData.value.toFixed(2) 
                          : propertyData.value || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {propertyData.unit}
                      </div>
                    </div>
                  ) : (
                    <Badge variant="secondary">No Data</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Property Coverage Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Property Coverage</span>
            <span className="text-sm text-gray-500">
              {Object.keys(properties).length} of {Object.keys(metadata).length} available
            </span>
          </div>
          <Progress 
            value={(Object.keys(properties).length / Math.max(Object.keys(metadata).length, 1)) * 100} 
            className="h-2"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {Object.keys(properties).length}
            </div>
            <div className="text-xs text-blue-700">Properties Available</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {Object.values(properties).reduce((sum, depths) => sum + Object.keys(depths).length, 0)}
            </div>
            <div className="text-xs text-green-700">Total Measurements</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}