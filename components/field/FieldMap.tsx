'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Save, X } from 'lucide-react';

// Fix for Leaflet default markers in Next.js
import 'leaflet/dist/leaflet.css';

// Define types
interface CropArea {
  id: string;
  name: string;
  cropType: string;
  area: number;
  coordinates: { latitude: number; longitude: number }[];
  plantingDate?: string;
  expectedHarvestDate?: string;
  status: 'planned' | 'planted' | 'growing' | 'ready_to_harvest' | 'harvested';
  notes?: string;
}

interface FieldMapProps {
  initialCenter?: [number, number];
  cropAreas: CropArea[];
  onCropAreasChange: (cropAreas: CropArea[]) => void;
  isEditing?: boolean;
}

// Drawing component that handles map clicks
function DrawingHandler({ 
  isDrawing, 
  currentPolygon, 
  setCurrentPolygon, 
  onPolygonComplete 
}: {
  isDrawing: boolean;
  currentPolygon: LatLng[];
  setCurrentPolygon: (polygon: LatLng[]) => void;
  onPolygonComplete: (polygon: LatLng[]) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        const newPoint = e.latlng;
        const newPolygon = [...currentPolygon, newPoint];
        setCurrentPolygon(newPolygon);
      }
    },
    dblclick: (e) => {
      if (isDrawing && currentPolygon.length >= 3) {
        e.originalEvent.preventDefault();
        onPolygonComplete(currentPolygon);
      }
    }
  });

  return null;
}

// Component to fit map bounds to show all crop areas
function FitBounds({ cropAreas }: { cropAreas: CropArea[] }) {
  const map = useMap();

  useEffect(() => {
    if (cropAreas.length > 0) {
      const allCoords = cropAreas.flatMap(area => 
        area.coordinates.map(coord => [coord.latitude, coord.longitude] as [number, number])
      );
      
      if (allCoords.length > 0) {
        const bounds = allCoords.reduce((bounds, coord) => bounds.extend(coord), 
          new (window as any).L.LatLngBounds(allCoords[0], allCoords[0]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [cropAreas, map]);

  return null;
}

const cropTypes = [
  'Maize', 'Wheat', 'Tomatoes', 'Potatoes', 'Carrots', 'Lettuce', 
  'Soybeans', 'Rice', 'Barley', 'Onions', 'Peppers', 'Cucumbers'
];

const statusColors = {
  planned: '#94a3b8',
  planted: '#22c55e',
  growing: '#eab308',
  ready_to_harvest: '#f97316',
  harvested: '#8b5cf6'
};

export default function FieldMap({ 
  initialCenter = [-26.2041, 28.0473], 
  cropAreas, 
  onCropAreasChange,
  isEditing = true 
}: FieldMapProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<LatLng[]>([]);
  const [showCropForm, setShowCropForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropArea | null>(null);
  const [newCropData, setNewCropData] = useState<{
    name: string;
    cropType: string;
    plantingDate: string;
    expectedHarvestDate: string;
    status: 'planned' | 'planted' | 'growing' | 'ready_to_harvest' | 'harvested';
    notes: string;
  }>({
    name: '',
    cropType: '',
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'planned',
    notes: ''
  });

  // Calculate area of polygon using shoelace formula
  const calculateArea = useCallback((coordinates: { latitude: number; longitude: number }[]): number => {
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i].latitude * coordinates[j].longitude;
      area -= coordinates[j].latitude * coordinates[i].longitude;
    }
    
    area = Math.abs(area) / 2;
    // Convert to approximate hectares (very rough approximation)
    return area * 111000 * 111000 / 10000; // Convert to hectares
  }, []);

  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentPolygon([]);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  const handlePolygonComplete = (polygon: LatLng[]) => {
    setIsDrawing(false);
    setShowCropForm(true);
    
    // Convert LatLng to our coordinate format
    const coordinates = polygon.map(point => ({
      latitude: point.lat,
      longitude: point.lng
    }));
    
    const area = calculateArea(coordinates);
    
    setNewCropData(prev => ({
      ...prev,
      area,
      coordinates
    }));
  };

  const saveCropArea = () => {
    if (!newCropData.name || !newCropData.cropType) return;

    const newCrop: CropArea = {
      id: Date.now().toString(),
      name: newCropData.name,
      cropType: newCropData.cropType,
      area: calculateArea(currentPolygon.map(p => ({ latitude: p.lat, longitude: p.lng }))),
      coordinates: currentPolygon.map(point => ({
        latitude: point.lat,
        longitude: point.lng
      })),
      plantingDate: newCropData.plantingDate || undefined,
      expectedHarvestDate: newCropData.expectedHarvestDate || undefined,
      status: newCropData.status,
      notes: newCropData.notes || undefined
    };

    onCropAreasChange([...cropAreas, newCrop]);
    
    // Reset form
    setCurrentPolygon([]);
    setShowCropForm(false);
    setNewCropData({
      name: '',
      cropType: '',
      plantingDate: '',
      expectedHarvestDate: '',
      status: 'planned',
      notes: ''
    });
  };

  const deleteCropArea = (id: string) => {
    onCropAreasChange(cropAreas.filter(crop => crop.id !== id));
  };

  const startEditingCrop = (crop: CropArea) => {
    setEditingCrop(crop);
    setNewCropData({
      name: crop.name,
      cropType: crop.cropType,
      plantingDate: crop.plantingDate || '',
      expectedHarvestDate: crop.expectedHarvestDate || '',
      status: crop.status,
      notes: crop.notes || ''
    });
  };

  const saveEditedCrop = () => {
    if (!editingCrop) return;

    const updatedCrop: CropArea = {
      ...editingCrop,
      name: newCropData.name,
      cropType: newCropData.cropType,
      plantingDate: newCropData.plantingDate || undefined,
      expectedHarvestDate: newCropData.expectedHarvestDate || undefined,
      status: newCropData.status,
      notes: newCropData.notes || undefined
    };

    onCropAreasChange(cropAreas.map(crop => 
      crop.id === editingCrop.id ? updatedCrop : crop
    ));

    setEditingCrop(null);
    setNewCropData({
      name: '',
      cropType: '',
      plantingDate: '',
      expectedHarvestDate: '',
      status: 'planned',
      notes: ''
    });
  };

  const cancelEdit = () => {
    setEditingCrop(null);
    setNewCropData({
      name: '',
      cropType: '',
      plantingDate: '',
      expectedHarvestDate: '',
      status: 'planned',
      notes: ''
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      {isEditing && (
        <div className="flex gap-2 p-4 bg-white border-b">
          {!isDrawing ? (
            <Button onClick={startDrawing} className="bg-green-600 hover:bg-green-700">
              Draw New Crop Area
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={cancelDrawing} variant="outline">
                Cancel Drawing
              </Button>
              <span className="text-sm text-gray-600 flex items-center">
                Click to add points, double-click to finish
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={initialCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Existing crop areas */}
            {cropAreas.map((crop) => (
              <Polygon
                key={crop.id}
                positions={crop.coordinates.map(coord => [coord.latitude, coord.longitude])}
                pathOptions={{
                  color: statusColors[crop.status],
                  fillColor: statusColors[crop.status],
                  fillOpacity: 0.3,
                  weight: 2
                }}
              />
            ))}

            {/* Current drawing polygon */}
            {currentPolygon.length > 0 && (
              <Polygon
                positions={currentPolygon.map(point => [point.lat, point.lng])}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            )}

            <DrawingHandler
              isDrawing={isDrawing}
              currentPolygon={currentPolygon}
              setCurrentPolygon={setCurrentPolygon}
              onPolygonComplete={handlePolygonComplete}
            />

            <FitBounds cropAreas={cropAreas} />
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          {/* Crop Form */}
          {(showCropForm || editingCrop) && (
            <Card className="m-4">
              <CardHeader>
                <CardTitle>
                  {editingCrop ? 'Edit Crop Area' : 'New Crop Area'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cropName">Crop Area Name</Label>
                  <Input
                    id="cropName"
                    value={newCropData.name}
                    onChange={(e) => setNewCropData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., North Field Tomatoes"
                  />
                </div>

                <div>
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select
                    value={newCropData.cropType}
                    onValueChange={(value) => setNewCropData(prev => ({ ...prev, cropType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newCropData.status}
                    onValueChange={(value: any) => setNewCropData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="planted">Planted</SelectItem>
                      <SelectItem value="growing">Growing</SelectItem>
                      <SelectItem value="ready_to_harvest">Ready to Harvest</SelectItem>
                      <SelectItem value="harvested">Harvested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plantingDate">Planting Date</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={newCropData.plantingDate}
                    onChange={(e) => setNewCropData(prev => ({ ...prev, plantingDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="harvestDate">Expected Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={newCropData.expectedHarvestDate}
                    onChange={(e) => setNewCropData(prev => ({ ...prev, expectedHarvestDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newCropData.notes}
                    onChange={(e) => setNewCropData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={editingCrop ? saveEditedCrop : saveCropArea}
                    className="flex-1"
                    disabled={!newCropData.name || !newCropData.cropType}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCrop ? 'Update' : 'Save'}
                  </Button>
                  <Button 
                    onClick={editingCrop ? cancelEdit : () => setShowCropForm(false)}
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crop Areas List */}
          <div className="p-4">
            <h3 className="font-semibold mb-4">Crop Areas ({cropAreas.length})</h3>
            <div className="space-y-2">
              {cropAreas.map((crop) => (
                <Card key={crop.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{crop.name}</h4>
                      <p className="text-sm text-gray-600">{crop.cropType}</p>
                    </div>
                    {isEditing && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingCrop(crop)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCropArea(crop.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Badge 
                      style={{ backgroundColor: statusColors[crop.status] }}
                      className="text-white"
                    >
                      {crop.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Area: {crop.area.toFixed(2)} hectares
                    </p>
                    {crop.plantingDate && (
                      <p className="text-xs text-gray-500">
                        Planted: {new Date(crop.plantingDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
