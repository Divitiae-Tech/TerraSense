// components/soil/chemical-properties.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Leaf, TestTube, Beaker } from 'lucide-react';

interface ChemicalPropertiesProps {
  analysis: {
    acidity?: {
      profile: Array<{
        depth: string;
        pH: number;
        acidityClass: string;
      }>;
      averagePH: number;
      pHVariation: number;
      limitingFactor: boolean;
    };
    nutrients?: {
      [nutrient: string]: {
        profile: Array<{
          depth: string;
          concentration: number;
          adequacyLevel: string;
        }>;
        averageLevel: number;
        deficiencyRisk: boolean;
        distribution: string;
      };
    };
    carbonContent?: {
      profile: Array<{
        depth: string;
        carbonContent: number;
        organicMatter: number;
        carbonClass: string;
      }>;
      totalCarbon: number;
      averageOM: number;
      carbonSequestrationPotential: string;
      soilHealth: string;
    };
  };
}

export function ChemicalProperties({ analysis }: ChemicalPropertiesProps) {
  const getpHColor = (pH: number) => {
    if (pH < 5.5) return 'bg-red-500';
    if (pH < 6.5) return 'bg-yellow-500';
    if (pH < 7.3) return 'bg-green-500';
    if (pH < 8.5) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  const getpHTextColor = (pH: number) => {
    if (pH < 5.5) return 'text-red-600';
    if (pH < 6.5) return 'text-yellow-600';
    if (pH < 7.3) return 'text-green-600';
    if (pH < 8.5) return 'text-blue-600';
    return 'text-purple-600';
  };

  const getNutrientColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'adequate': return 'bg-green-500';
      case 'marginal': return 'bg-yellow-500';
      case 'deficient': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCarbonHealthColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case 'good': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Safe access to nested properties
  const acidity = analysis?.acidity;
  const nutrients = analysis?.nutrients;
  const carbonContent = analysis?.carbonContent;

  return (
    <div className="space-y-6">
      {/* pH and Acidity */}
      {acidity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Soil pH & Acidity
            </CardTitle>
            <CardDescription>
              Soil reaction and acidity levels across depth profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* pH Overview */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getpHTextColor(acidity.averagePH || 0)}`}>
                    {(acidity.averagePH || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average pH</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {(acidity.pHVariation || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">pH Variation</div>
                </div>
                <div className="text-center">
                  <Badge variant={acidity.limitingFactor ? "destructive" : "default"}>
                    {acidity.limitingFactor ? "Limiting" : "Suitable"}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">pH Status</div>
                </div>
              </div>
            </div>

            {/* pH Profile */}
            <div>
              <h4 className="font-semibold mb-3">pH Profile by Depth</h4>
              <div className="space-y-2">
                {(acidity.profile || []).map((layer, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 text-sm font-medium text-gray-700">
                      {layer.depth} cm
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">pH Level</span>
                        <span className={`text-sm font-medium ${getpHTextColor(layer.pH || 0)}`}>
                          {(layer.pH || 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getpHColor(layer.pH || 0)}`}
                          style={{ width: `${((layer.pH || 0) / 14) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {layer.acidityClass || 'N/A'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* pH Scale Reference */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">pH Scale Reference</h5>
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-600">← Acidic</span>
                <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-purple-600">Alkaline →</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3.0</span>
                <span>5.5</span>
                <span>7.0</span>
                <span>8.5</span>
                <span>11.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrient Analysis */}
      {nutrients && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              Nutrient Analysis
            </CardTitle>
            <CardDescription>
              Essential nutrient levels and availability assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(nutrients).map(([nutrient, data]) => (
                <div key={nutrient} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium capitalize">{nutrient}</h5>
                    <Badge className={`${getNutrientColor(data.profile[0]?.adequacyLevel || '')} text-white`}>
                      {data.profile[0]?.adequacyLevel || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Level:</span>
                      <span className="font-medium">{(data.averageLevel || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Distribution:</span>
                      <span className="font-medium text-right">{data.distribution || 'N/A'}</span>
                    </div>
                    
                    {data.deficiencyRisk && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Deficiency risk detected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrient Balance Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
              <h5 className="font-medium mb-3">Nutrient Balance Summary</h5>
              <div className="space-y-2">
                {Object.entries(nutrients).map(([nutrient, data]) => (
                  <div key={nutrient} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-20 capitalize">{nutrient}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          data.profile[0]?.adequacyLevel === 'adequate' ? 'bg-green-500' :
                          data.profile[0]?.adequacyLevel === 'marginal' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${
                            data.profile[0]?.adequacyLevel === 'adequate' ? 100 :
                            data.profile[0]?.adequacyLevel === 'marginal' ? 60 : 30
                          }%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {(data.averageLevel || 0).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carbon Content and Organic Matter */}
      {carbonContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Organic Carbon & Soil Health
            </CardTitle>
            <CardDescription>
              Soil organic carbon content and sequestration potential
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Carbon Overview */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {(carbonContent.totalCarbon || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-green-700">Total Carbon (g/kg)</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {(carbonContent.averageOM || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-blue-700">Organic Matter</div>
                </div>
                <div className="text-center">
                  <Badge className={`${getCarbonHealthColor(carbonContent.soilHealth || '')} text-white`}>
                    {carbonContent.soilHealth || 'N/A'}
                  </Badge>
                  <div className="text-xs text-gray-600 mt-1">Soil Health</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-purple-600">
                    {carbonContent.carbonSequestrationPotential || 'N/A'}
                  </div>
                  <div className="text-xs text-purple-700">C Sequestration</div>
                </div>
              </div>
            </div>

            {/* Carbon Profile */}
            <div>
              <h4 className="font-semibold mb-3">Organic Carbon Profile</h4>
              <div className="space-y-2">
                {(carbonContent.profile || []).map((layer, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 text-sm font-medium text-gray-700">
                      {layer.depth} cm
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Carbon Content</span>
                        <span className="text-sm font-medium">
                          {(layer.carbonContent || 0).toFixed(2)} g/kg
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(((layer.carbonContent || 0) / 5) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(layer.organicMatter || 0).toFixed(1)}% organic matter
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {layer.carbonClass || 'N/A'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Carbon Guidelines */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Soil Organic Carbon Guidelines</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span> 0.6% - Very Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>0.6-1.2% - Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>1.2-1.8% - Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>1.8% - High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}