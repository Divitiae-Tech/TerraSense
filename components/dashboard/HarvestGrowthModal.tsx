'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

interface CropDataPoint {
  month: string;
  [cropName: string]: string | number;
}

interface Crop {
  id: string;
  name: string;
  color: string;
}

interface CropHarvest {
  _id: string;
  cropId: string;
  season: string;
  harvestDate: string;
  yieldAmount: number;
}

interface HarvestGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChange?: (chartData: CropDataPoint[], crops: Crop[]) => void;
}

const predefinedColors = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#84cc16', // lime
  '#6366f1', // indigo
];

export const HarvestGrowthModal = ({ isOpen, onClose, onDataChange }: HarvestGrowthModalProps) => {
  const { user } = useUser();
  
  // Get user from Convex based on Clerk user
  const convexUser = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
  const cropHarvests = useQuery(
    api.database.getCropHarvests, 
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const userCrops = useQuery(
    api.database.getAllUserData,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const [crops, setCrops] = useState<Crop[]>([]);
  const [chartData, setChartData] = useState<CropDataPoint[]>([]);

  const [newCropName, setNewCropName] = useState('');
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [editingCrop, setEditingCrop] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Process real data when it loads
  useEffect(() => {
    if (cropHarvests && userCrops?.crops) {
      // Create crop list with colors
      const cropMap = new Map();
      userCrops.crops.forEach((crop: any, index: number) => {
        if (!cropMap.has(crop.name)) {
          cropMap.set(crop.name, {
            id: crop._id,
            name: crop.name,
            color: predefinedColors[index % predefinedColors.length]
          });
        }
      });
      
      const processedCrops = Array.from(cropMap.values());
      setCrops(processedCrops);

      // Process harvest data by month
      const monthlyData = new Map();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize months
      months.forEach(month => {
        monthlyData.set(month, { month });
        processedCrops.forEach(crop => {
          monthlyData.get(month)[crop.name] = 0;
        });
      });

      // Aggregate harvest data by month and crop
      cropHarvests.forEach((harvest: CropHarvest) => {
        const harvestDate = new Date(harvest.harvestDate);
        const monthIndex = harvestDate.getMonth();
        const monthName = months[monthIndex];
        
        // Find crop name
        const crop = userCrops.crops.find((c: any) => c._id === harvest.cropId);
        if (crop && monthlyData.has(monthName)) {
          const currentValue = monthlyData.get(monthName)[crop.name] || 0;
          monthlyData.get(monthName)[crop.name] = currentValue + harvest.yieldAmount;
        }
      });

      const processedChartData = Array.from(monthlyData.values());
      setChartData(processedChartData);
    }
  }, [cropHarvests, userCrops]);

  // Notify parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(chartData, crops);
    }
  }, [chartData, crops, onDataChange]);

  if (!isOpen) return null;

  const addCrop = () => {
    if (!newCropName.trim()) return;
    
    const newCrop: Crop = {
      id: Date.now().toString(),
      name: newCropName,
      color: predefinedColors[crops.length % predefinedColors.length],
    };
    
    setCrops([...crops, newCrop]);
    
    // Add default data points for the new crop
    setChartData(prevData => 
      prevData.map(point => ({
        ...point,
        [newCropName]: 0,
      }))
    );
    
    setNewCropName('');
  };

  const removeCrop = (cropId: string, cropName: string) => {
    setCrops(crops.filter(crop => crop.id !== cropId));
    
    // Remove crop data from chart data
    setChartData(prevData => 
      prevData.map(point => {
        const { [cropName]: removed, ...rest } = point;
        return rest;
      })
    );
  };

  const startEditing = (pointIndex: number, cropName: string, currentValue: number) => {
    setEditingPointIndex(pointIndex);
    setEditingCrop(cropName);
    setEditValue(currentValue.toString());
  };

  const saveEdit = () => {
    if (editingPointIndex === null || !editingCrop) return;
    
    const newValue = parseFloat(editValue) || 0;
    setChartData(prevData => 
      prevData.map((point, index) => 
        index === editingPointIndex 
          ? { ...point, [editingCrop]: newValue }
          : point
      )
    );
    
    setEditingPointIndex(null);
    setEditingCrop(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingPointIndex(null);
    setEditingCrop(null);
    setEditValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Harvest Growth Analytics</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Chart */}
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    className="text-sm"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-sm"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {crops.map((crop) => (
                    <Line
                      key={crop.id}
                      type="monotone"
                      dataKey={crop.name}
                      stroke={crop.color}
                      strokeWidth={3}
                      dot={{ fill: crop.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">No harvest data available</p>
                  <p className="text-sm">Add some harvest records to see the growth chart</p>
                </div>
              </div>
            )}
          </div>

          {/* Crop Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Manage Crops</h3>
            
            {/* Add New Crop */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter crop name"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCrop()}
              />
              <Button onClick={addCrop} disabled={!newCropName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Crop
              </Button>
            </div>

            {/* Crop List */}
            <div className="grid gap-2">
              {crops.map((crop) => (
                <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: crop.color }}
                    />
                    <span className="font-medium">{crop.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCrop(crop.id, crop.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Points Editor */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Edit Data Points</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-2 text-left">Month</th>
                    {crops.map((crop) => (
                      <th key={crop.id} className="border border-gray-200 p-2 text-left">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: crop.color }}
                          />
                          {crop.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((dataPoint, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 p-2 font-medium">
                        {dataPoint.month}
                      </td>
                      {crops.map((crop) => (
                        <td key={crop.id} className="border border-gray-200 p-2">
                          {editingPointIndex === index && editingCrop === crop.name ? (
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-20 h-8"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                autoFocus
                              />
                              <Button size="sm" onClick={saveEdit} className="h-8 px-2">
                                ✓
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 px-2">
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <span>{dataPoint[crop.name]}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(index, crop.name, dataPoint[crop.name] as number)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};