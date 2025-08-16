'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, Trash2, Edit } from 'lucide-react';
import FieldMap from './DynamicFieldMap';
import { Id } from '@/convex/_generated/dataModel';

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

interface Field {
  _id: Id<'fields'>;
  name: string;
  description?: string;
  totalArea: number;
  location: {
    latitude: number;
    longitude: number;
  };
  boundaries: { latitude: number; longitude: number }[];
  cropAreas: CropArea[];
  createdAt: number;
  updatedAt: number;
}

export default function FieldManager() {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    name: '',
    description: '',
    location: { latitude: -26.2041, longitude: 28.0473 }
  });

  // Get current user
  const { user, isLoaded } = useUser();
  
  // Get user from Convex database
  const currentUser = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );

  // Convex queries and mutations
  const fields = useQuery(api.fields.getUserFields, 
    currentUser ? { userId: currentUser._id } : "skip"
  ) || [];
  const createField = useMutation(api.fields.createField);
  const updateField = useMutation(api.fields.updateField);
  const deleteField = useMutation(api.fields.deleteField);

  // Show loading state while authentication is loading
  if (!isLoaded) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div>
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">
              Please sign in to access field management features and start mapping your crop areas.
            </p>
            <Button 
              onClick={() => window.location.href = '/sign-in'}
              className="bg-green-600 hover:bg-green-700"
            >
              Sign In to Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleCreateField = async () => {
    if (!newFieldData.name || !currentUser) return;

    setIsCreating(true);
    try {
      await createField({
        userId: currentUser._id,
        name: newFieldData.name,
        description: newFieldData.description || undefined,
        totalArea: 0, // Will be calculated from crop areas
        location: newFieldData.location,
        boundaries: [], // Will be set when drawing field boundaries
        cropAreas: []
      });

      setShowNewFieldDialog(false);
      setNewFieldData({
        name: '',
        description: '',
        location: { latitude: -26.2041, longitude: 28.0473 }
      });
    } catch (error) {
      console.error('Error creating field:', error);
      alert('Failed to create field. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateFieldCropAreas = async (cropAreas: CropArea[]) => {
    if (!selectedField || !currentUser) return;

    try {
      // Calculate total area from crop areas
      const totalArea = cropAreas.reduce((sum, crop) => sum + crop.area, 0);

      await updateField({
        userId: currentUser._id,
        fieldId: selectedField._id,
        cropAreas,
        totalArea
      });

      // Update local state
      setSelectedField(prev => prev ? { ...prev, cropAreas, totalArea } : null);
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const handleDeleteField = async (fieldId: Id<'fields'>) => {
    if (confirm('Are you sure you want to delete this field?')) {
      try {
        await deleteField({ fieldId });
        if (selectedField?._id === fieldId) {
          setSelectedField(null);
        }
      } catch (error) {
        console.error('Error deleting field:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-gray-500',
      planted: 'bg-green-500',
      growing: 'bg-yellow-500',
      ready_to_harvest: 'bg-orange-500',
      harvested: 'bg-purple-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (selectedField) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedField(null)}
            >
              ← Back to Fields
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedField.name}</h1>
              {selectedField.description && (
                <p className="text-gray-600">{selectedField.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Total Area: {selectedField.totalArea.toFixed(2)} hectares
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {selectedField.cropAreas.length} crop areas
            </div>
          </div>
        </div>

        <div className="flex-1">
          <FieldMap
            initialCenter={[selectedField.location.latitude, selectedField.location.longitude]}
            cropAreas={selectedField.cropAreas}
            onCropAreasChange={handleUpdateFieldCropAreas}
            isEditing={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Field Management</h1>
          <p className="text-gray-600">Manage your fields and crop areas</p>
        </div>
        <Dialog open={showNewFieldDialog} onOpenChange={setShowNewFieldDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Field</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fieldName">Field Name</Label>
                <Input
                  id="fieldName"
                  value={newFieldData.name}
                  onChange={(e) => setNewFieldData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., North Field"
                />
              </div>
              <div>
                <Label htmlFor="fieldDescription">Description (Optional)</Label>
                <Input
                  id="fieldDescription"
                  value={newFieldData.description}
                  onChange={(e) => setNewFieldData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Field description..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateField}
                  disabled={!newFieldData.name || !currentUser || isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Field'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewFieldDialog(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Fields Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first field to start mapping your crop areas and managing your farm layout.
            </p>
            <Button
              onClick={() => setShowNewFieldDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Field
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <Card key={field._id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{field.name}</CardTitle>
                    {field.description && (
                      <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteField(field._id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Area:</span>
                    <span className="font-medium">{field.totalArea.toFixed(2)} hectares</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Crop Areas:</span>
                    <span className="font-medium">{field.cropAreas.length}</span>
                  </div>
                  
                  {field.cropAreas.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Recent Crops:</p>
                      <div className="flex flex-wrap gap-1">
                        {field.cropAreas.slice(0, 3).map((crop) => (
                          <Badge
                            key={crop.id}
                            className={`text-xs ${getStatusColor(crop.status)} text-white`}
                          >
                            {crop.cropType}
                          </Badge>
                        ))}
                        {field.cropAreas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{field.cropAreas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4"
                    onClick={() => setSelectedField(field)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Field
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
