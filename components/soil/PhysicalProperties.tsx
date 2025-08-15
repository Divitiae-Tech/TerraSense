// components/soil/physical-properties.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mountain, Layers, Gauge } from 'lucide-react';

interface PhysicalPropertiesProps {
  analysis: {
    texture?: {
      clay: number;
      sand: number;
      silt: number;
      textureClass: string;
      textureIndex: number;
      structureStability: number;
    };
    density?: {
      profile: Array<{
        depth: string;
        bulkDensity: number;
        compaction: string;
      }>;
      averageDensity: number;
      compactionRisk: string;
    };
  };
}

export function PhysicalProperties({ analysis }: PhysicalPropertiesProps) {
  const getCompactionColor = (compaction: string) => {
    switch (compaction?.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTextureColor = (percentage: number, max: number = 100) => {
    const intensity = (percentage / max) * 100;
    if (intensity > 60) return 'bg-blue-500';
    if (intensity > 30) return 'bg-blue-300';
    return 'bg-blue-100';
  };

  // Handle undefined values with fallbacks
  const texture = analysis?.texture;
  const density = analysis?.density;

  return (
    <div className="space-y-6">
      {/* Soil Texture */}
      {texture && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-orange-600" />
              Soil Texture Analysis
            </CardTitle>
            <CardDescription>
              Particle size distribution and texture classification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Texture Triangle Representation */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-orange-700">
                  {texture.textureClass || 'N/A'}
                </div>
                <div className="text-sm text-orange-600">Soil Texture Class</div>
              </div>
              
              {/* Texture Percentages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Clay</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${texture.clay || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {(texture.clay || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sand</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${texture.sand || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {(texture.sand || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Silt</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brown-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${texture.silt || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {(texture.silt || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Texture Indices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {(texture.textureIndex || 0).toFixed(2)}
                </div>
                <div className="text-xs text-blue-700">Fineness Index</div>
                <div className="text-xs text-gray-500 mt-1">
                  Higher values = finer texture
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {((texture.structureStability || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-green-700">Structure Stability</div>
                <div className="text-xs text-gray-500 mt-1">
                  Aggregate stability index
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Density and Compaction */}
      {density && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-purple-600" />
              Soil Density & Compaction
            </CardTitle>
            <CardDescription>
              Bulk density profile and compaction assessment across soil layers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Density Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(density.averageDensity || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-purple-700">
                    Average Bulk Density (g/cm³)
                  </div>
                </div>
                <div className="text-center">
                  <Badge className={`${getCompactionColor(density.compactionRisk)} text-white`}>
                    {(density.compactionRisk || 'unknown').charAt(0).toUpperCase() + (density.compactionRisk || 'unknown').slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">
                    Compaction Risk
                  </div>
                </div>
              </div>
            </div>

            {/* Depth Profile */}
            <div>
              <h4 className="font-semibold mb-3">Density Profile by Depth</h4>
              <div className="space-y-2">
                {(density.profile || []).map((layer, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 text-sm font-medium text-gray-700">
                      {layer.depth} cm
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Bulk Density</span>
                        <span className="text-sm font-medium">
                          {(layer.bulkDensity || 0).toFixed(2)} g/cm³
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (layer.bulkDensity || 0) > 1.6 ? 'bg-red-500' :
                            (layer.bulkDensity || 0) > 1.4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(((layer.bulkDensity || 0) / 2) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getCompactionColor(layer.compaction)} text-white text-xs`}
                    >
                      {layer.compaction || 'unknown'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Density Guidelines */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Bulk Density Guidelines</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span> 1.4 g/cm³ - Good porosity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>1.4-1.6 g/cm³ - Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span> 1.6 g/cm³ - High compaction</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}