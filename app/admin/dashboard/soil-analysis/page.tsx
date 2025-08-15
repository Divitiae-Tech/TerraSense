// app/soil-analysis/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import soil analysis components
import { SoilPropertiesOverview } from '@/components/soil/SoilPropertiesOverview';
import { PhysicalProperties } from '@/components/soil/PhysicalProperties';
import { ChemicalProperties } from '@/components/soil/ChemicalProperties';
import { BiologicalProperties } from '@/components/soil/BiologicalProperties';
import { HydrologicalProperties } from '@/components/soil/HydrologicalProperties';
import { SoilClassification } from '@/components/soil/SoilClassification';
import { AgriculturalSuitability } from '@/components/soil/AgriculturalSuitablility';
import { EnvironmentalContext } from '@/components/soil/EnvironmentalContext';
import { DataQualityMetrics } from '@/components/soil/DataQualityMetrics';
import { SoilDepthProfile } from '@/components/soil/SoilDepthProfile';

interface SoilData {
  metadata: {
    timestamp: string;
    location: {
      latitude: number;
      longitude: number;
      coordinateSystem: string;
    };
    dataSource: string;
    propertiesFetched: number;
    depthLayers: string[];
    totalDataPoints: number;
    dataCompleteness: number;
    processingVersion: string;
  };
  soilProperties: Record<string, Record<string, any>>;
  analysis: {
    physical: any;
    chemical: any;
    biological: any;
    hydrological: any;
    structural: any;
  };
  classification: any;
  suitability: any;
  environmental: any;
  dataQuality: any;
  temporal: any;
  propertyMetadata: Record<string, any>;
}

export default function SoilAnalysisDashboard() {
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState('-26.2041');
  const [longitude, setLongitude] = useState('28.0473');

const fetchSoilData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/soil-analysis?lat=${latitude}&lon=${longitude}&includeRaw=true`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check if the API route is properly configured.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch soil data: ${response.status}`);
      }
      
      const data = await response.json();
      setSoilData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching soil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoilData();
  }, []);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSoilData();
  };

  const getDataCompletenessColor = (completeness: number) => {
    if (completeness >= 0.8) return 'bg-green-500';
    if (completeness >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🌱 Comprehensive Soil Analysis Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced soil property analysis using iSDAsoil API data with comprehensive 
            physical, chemical, and biological assessments for agricultural optimization.
          </p>
        </div>

        {/* Location Input */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Location Coordinates
            </CardTitle>
            <CardDescription>
              Enter latitude and longitude to analyze soil properties at that location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLocationSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="-26.2041"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="28.0473"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Soil'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Data Overview */}
        {soilData && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Overview</CardTitle>
              <CardDescription>
                Data retrieved on {new Date(soilData.metadata.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {soilData.metadata.propertiesFetched}
                  </div>
                  <div className="text-sm text-gray-600">Properties Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {soilData.metadata.depthLayers.length}
                  </div>
                  <div className="text-sm text-gray-600">Depth Layers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {soilData.metadata.totalDataPoints}
                  </div>
                  <div className="text-sm text-gray-600">Data Points</div>
                </div>
                <div className="text-center">
                  <Badge 
                    className={`${getDataCompletenessColor(soilData.metadata.dataCompleteness)} text-white`}
                  >
                    {(soilData.metadata.dataCompleteness * 100).toFixed(1)}% Complete
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">Data Quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Analysis Tabs */}
        {soilData && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="chemical">Chemical</TabsTrigger>
              <TabsTrigger value="biological">Biological</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="suitability">Suitability</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SoilPropertiesOverview 
                  properties={soilData.soilProperties} 
                  metadata={soilData.propertyMetadata}
                />
                <DataQualityMetrics 
                  dataQuality={soilData.dataQuality}
                  metadata={soilData.metadata}
                />
              </div>
              <SoilDepthProfile 
                properties={soilData.soilProperties}
                depthLayers={soilData.metadata.depthLayers}
              />
            </TabsContent>

            <TabsContent value="physical" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PhysicalProperties analysis={soilData.analysis.physical} />
                <HydrologicalProperties analysis={soilData.analysis.hydrological} />
              </div>
            </TabsContent>

            <TabsContent value="chemical" className="space-y-6">
              <ChemicalProperties analysis={soilData.analysis.chemical} />
            </TabsContent>

            <TabsContent value="biological" className="space-y-6">
              <BiologicalProperties analysis={soilData.analysis.biological} />
            </TabsContent>

            <TabsContent value="classification" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SoilClassification classification={soilData.classification} />
                <EnvironmentalContext environmental={soilData.environmental} />
              </div>
            </TabsContent>

            <TabsContent value="suitability" className="space-y-6">
              <AgriculturalSuitability suitability={soilData.suitability} />
            </TabsContent>
          </Tabs>
        )}

        {/* Loading State */}
        {loading && !soilData && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-lg text-gray-600">Analyzing soil properties...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        )}
      </div>
    </div>
  );
}