// components/soil/biological-properties.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bug, Leaf, Activity, Zap } from 'lucide-react';

interface BiologicalPropertiesProps {
  analysis: {
    organicMatter?: {
      carbonNitrogenRatio: number | null;
      organicMatterQuality: string;
      decompositionRate: string;
      biologicalActivityIndex: number;
    };
  };
}

export function BiologicalProperties({ analysis }: BiologicalPropertiesProps) {
  const getCNRatioColor = (ratio: number | null) => {
    if (!ratio) return 'bg-gray-500';
    if (ratio < 15) return 'bg-green-500';
    if (ratio < 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCNRatioStatus = (ratio: number | null) => {
    if (!ratio) return 'Unknown';
    if (ratio < 15) return 'Optimal';
    if (ratio < 25) return 'Moderate';
    return 'High';
  };

  const getActivityColor = (index: number) => {
    if (index > 70) return 'bg-green-500';
    if (index > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getActivityStatus = (index: number) => {
    if (index > 70) return 'High Activity';
    if (index > 40) return 'Moderate Activity';
    return 'Low Activity';
  };

  const getDecompositionColor = (rate: string) => {
    switch (rate?.toLowerCase()) {
      case 'rapid': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityColor = (quality: string) => {
    if (quality?.includes('high quality')) return 'bg-green-500';
    if (quality?.includes('moderate')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Safely access the analysis object
  const organicMatter = analysis?.organicMatter;

  return (
    <div className="space-y-6">
      {organicMatter && (
        <>
          {/* Biological Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Biological Activity Index
              </CardTitle>
              <CardDescription>
                Overall assessment of soil biological activity and health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {organicMatter.biologicalActivityIndex !== undefined && organicMatter.biologicalActivityIndex !== null 
                      ? organicMatter.biologicalActivityIndex.toFixed(0) 
                      : 'N/A'}
                  </div>
                  <Badge className={`${getActivityColor(organicMatter.biologicalActivityIndex)} text-white`}>
                    {getActivityStatus(organicMatter.biologicalActivityIndex)}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-2">
                    Biological Activity Score (0-100)
                  </div>
                </div>

                {/* Activity Level Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${getActivityColor(organicMatter.biologicalActivityIndex)}`}
                    style={{ width: `${Math.min(organicMatter.biologicalActivityIndex || 0, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low (0-40)</span>
                  <span>Moderate (40-70)</span>
                  <span>High (70-100)</span>
                </div>
              </div>

              {/* Activity Interpretation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Bug className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-green-700">Microbial Activity</div>
                  <div className="text-xs text-green-600">
                    {organicMatter.biologicalActivityIndex > 60 ? 'High' : 
                     organicMatter.biologicalActivityIndex > 30 ? 'Moderate' : 'Low'}
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Leaf className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-blue-700">Nutrient Cycling</div>
                  <div className="text-xs text-blue-600">
                    {organicMatter.biologicalActivityIndex > 50 ? 'Active' : 'Limited'}
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-purple-700">Soil Health</div>
                  <div className="text-xs text-purple-600">
                    {organicMatter.biologicalActivityIndex > 70 ? 'Excellent' :
                     organicMatter.biologicalActivityIndex > 40 ? 'Good' : 'Poor'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organic Matter Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-brown-600" />
                Organic Matter Quality & Decomposition
              </CardTitle>
              <CardDescription>
                Assessment of organic matter composition and decomposition dynamics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* C:N Ratio */}
              <div className="bg-gradient-to-r from-brown-50 to-green-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brown-600">
                      {organicMatter.carbonNitrogenRatio !== null && organicMatter.carbonNitrogenRatio !== undefined ? 
                        `${organicMatter.carbonNitrogenRatio.toFixed(1)}:1` : 
                        'N/A'}
                    </div>
                    <div className="text-sm text-brown-700 mb-2">Carbon:Nitrogen Ratio</div>
                    <Badge className={`${getCNRatioColor(organicMatter.carbonNitrogenRatio)} text-white`}>
                      {getCNRatioStatus(organicMatter.carbonNitrogenRatio)}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getDecompositionColor(organicMatter.decompositionRate)}`}>
                      {organicMatter.decompositionRate || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Decomposition Rate</div>
                    <Badge className={`${getQualityColor(organicMatter.organicMatterQuality)} text-white`}>
                      Quality: {organicMatter.organicMatterQuality?.split(' - ')[0] || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Decomposition Analysis */}
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg">
                  <h5 className="font-medium text-green-700 mb-1">Organic Matter Quality</h5>
                  <p className="text-sm text-green-600">
                    {organicMatter.organicMatterQuality || 'N/A'}
                  </p>
                </div>

                {organicMatter.carbonNitrogenRatio !== null && organicMatter.carbonNitrogenRatio !== undefined && (
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                    <h5 className="font-medium text-blue-700 mb-1">C:N Ratio Interpretation</h5>
                    <p className="text-sm text-blue-600">
                      {organicMatter.carbonNitrogenRatio < 20 
                        ? "Optimal ratio for rapid decomposition and nutrient release. Good for plant growth."
                        : organicMatter.carbonNitrogenRatio < 30
                        ? "Moderate ratio. Decomposition will be steady with moderate nutrient release."
                        : "High ratio indicates slow decomposition. May temporarily tie up soil nitrogen."}
                    </p>
                  </div>
                )}

                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r-lg">
                  <h5 className="font-medium text-purple-700 mb-1">Decomposition Rate</h5>
                  <p className="text-sm text-purple-600">
                    {organicMatter.decompositionRate === 'rapid' 
                      ? "Fast breakdown of organic matter. Good nutrient availability but may require frequent organic inputs."
                      : organicMatter.decompositionRate === 'moderate'
                      ? "Balanced decomposition rate. Provides steady nutrient release over time."
                      : "Slow organic matter breakdown. Nutrients are released gradually, providing long-term soil improvement."}
                  </p>
                </div>
              </div>

              {/* Management Recommendations */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-3">Management Recommendations</h5>
                <div className="space-y-2 text-sm">
                  {organicMatter.biologicalActivityIndex !== undefined && 
                   organicMatter.biologicalActivityIndex !== null && 
                   organicMatter.biologicalActivityIndex < 40 && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Consider adding compost or organic amendments to improve biological activity</span>
                    </div>
                  )}
                  
                  {organicMatter.carbonNitrogenRatio !== null && 
                   organicMatter.carbonNitrogenRatio !== undefined &&
                   organicMatter.carbonNitrogenRatio > 30 && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>High C:N ratio - consider adding nitrogen-rich materials (legume cover crops, manure)</span>
                    </div>
                  )}
                  
                  {organicMatter.decompositionRate === 'slow' && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Slow decomposition provides long-term benefits. Consider diverse organic inputs for balance</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Maintain soil cover and minimize tillage to preserve soil biological activity</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Data State */}
      {!organicMatter && (
        <Card>
          <CardContent className="text-center py-8">
            <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Biological Properties Data Not Available
            </h3>
            <p className="text-gray-500">
              Biological analysis requires organic matter and nutrient data to calculate activity indices.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}