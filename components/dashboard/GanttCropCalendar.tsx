'use client';
import { useAIAssistant } from '../../hooks/useAIAssistant';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  Plus,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface CropSeason {
  crop: string;
  icon: React.ReactNode;
  plantingStart: number; // month (0-11)
  plantingEnd: number;
  harvestStart: number;
  harvestEnd: number;
}

interface GanttCropCalendarProps {
  isFullPage?: boolean;
}

export const GanttCropCalendar = ({ isFullPage = false }: GanttCropCalendarProps) => {
  // State and hooks
  const [cropData, setCropData] = useState<CropSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<'PLANTING' | 'HARVEST'>('PLANTING');
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const addCrop = useMutation(api.database.createCrop);
  const updateCrop = useMutation(api.database.updateCrop);
  const deleteCrop = useMutation(api.database.deleteRecord);
  const userData = useQuery(
    api.aiAssistant.getUserContext,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  
  // Memoize arrays to prevent infinite re-renders
  const crops = React.useMemo(() => userData?.crops || [], [userData?.crops]);

  // AI logic for optimal planting and harvesting seasons
  const getOptimalSeasons = React.useCallback((cropType: string) => {
    const seasonalCrops: Record<string, { plantingStart: number, plantingEnd: number, harvestStart: number, harvestEnd: number }> = {
      // Grains
      'maize': { plantingStart: 2, plantingEnd: 4, harvestStart: 7, harvestEnd: 9 }, // Mar-May planting, Aug-Oct harvest
      'corn': { plantingStart: 2, plantingEnd: 4, harvestStart: 7, harvestEnd: 9 },
      'wheat': { plantingStart: 9, plantingEnd: 11, harvestStart: 2, harvestEnd: 4 }, // Oct-Dec planting, Mar-May harvest
      'rice': { plantingStart: 1, plantingEnd: 3, harvestStart: 6, harvestEnd: 8 }, // Feb-Apr planting, Jul-Sep harvest
      'barley': { plantingStart: 8, plantingEnd: 10, harvestStart: 1, harvestEnd: 3 }, // Sep-Nov planting, Feb-Apr harvest
      
      // Vegetables
      'tomato': { plantingStart: 1, plantingEnd: 3, harvestStart: 4, harvestEnd: 7 }, // Feb-Apr planting, May-Aug harvest
      'tomatoes': { plantingStart: 1, plantingEnd: 3, harvestStart: 4, harvestEnd: 7 },
      'potato': { plantingStart: 7, plantingEnd: 9, harvestStart: 11, harvestEnd: 1 }, // Aug-Oct planting, Dec-Feb harvest
      'potatoes': { plantingStart: 7, plantingEnd: 9, harvestStart: 11, harvestEnd: 1 },
      'carrot': { plantingStart: 2, plantingEnd: 5, harvestStart: 5, harvestEnd: 8 }, // Mar-Jun planting, Jun-Sep harvest
      'carrots': { plantingStart: 2, plantingEnd: 5, harvestStart: 5, harvestEnd: 8 },
      'onion': { plantingStart: 1, plantingEnd: 3, harvestStart: 6, harvestEnd: 8 }, // Feb-Apr planting, Jul-Sep harvest
      'onions': { plantingStart: 1, plantingEnd: 3, harvestStart: 6, harvestEnd: 8 },
      'cabbage': { plantingStart: 1, plantingEnd: 3, harvestStart: 4, harvestEnd: 6 }, // Feb-Apr planting, May-Jul harvest
      'lettuce': { plantingStart: 1, plantingEnd: 10, harvestStart: 2, harvestEnd: 11 }, // Year-round with gaps
      'spinach': { plantingStart: 1, plantingEnd: 4, harvestStart: 2, harvestEnd: 6 }, // Feb-May planting, Mar-Jul harvest
      'beans': { plantingStart: 2, plantingEnd: 4, harvestStart: 5, harvestEnd: 7 }, // Mar-May planting, Jun-Aug harvest
      'peas': { plantingStart: 1, plantingEnd: 3, harvestStart: 3, harvestEnd: 5 }, // Feb-Apr planting, Apr-Jun harvest
      'cucumber': { plantingStart: 2, plantingEnd: 4, harvestStart: 4, harvestEnd: 7 }, // Mar-May planting, May-Aug harvest
      'squash': { plantingStart: 2, plantingEnd: 4, harvestStart: 5, harvestEnd: 8 }, // Mar-May planting, Jun-Sep harvest
      'peppers': { plantingStart: 1, plantingEnd: 3, harvestStart: 5, harvestEnd: 8 }, // Feb-Apr planting, Jun-Sep harvest
      
      // Fruits
      'apple': { plantingStart: 5, plantingEnd: 7, harvestStart: 0, harvestEnd: 3 }, // Jun-Aug planting, Jan-Apr harvest
      'apples': { plantingStart: 5, plantingEnd: 7, harvestStart: 0, harvestEnd: 3 },
      'orange': { plantingStart: 2, plantingEnd: 4, harvestStart: 9, harvestEnd: 11 }, // Mar-May planting, Oct-Dec harvest
      'oranges': { plantingStart: 2, plantingEnd: 4, harvestStart: 9, harvestEnd: 11 },
      'strawberry': { plantingStart: 1, plantingEnd: 3, harvestStart: 7, harvestEnd: 10 }, // Feb-Apr planting, Aug-Nov harvest
      'strawberries': { plantingStart: 1, plantingEnd: 3, harvestStart: 7, harvestEnd: 10 },
      'watermelon': { plantingStart: 2, plantingEnd: 4, harvestStart: 6, harvestEnd: 8 }, // Mar-May planting, Jul-Sep harvest
      'melon': { plantingStart: 2, plantingEnd: 4, harvestStart: 6, harvestEnd: 8 },
      'grapes': { plantingStart: 5, plantingEnd: 7, harvestStart: 0, harvestEnd: 2 }, // Jun-Aug planting, Jan-Mar harvest
      
      // Root crops
      'sweet potato': { plantingStart: 2, plantingEnd: 4, harvestStart: 7, harvestEnd: 9 }, // Mar-May planting, Aug-Oct harvest
      'radish': { plantingStart: 1, plantingEnd: 10, harvestStart: 2, harvestEnd: 11 }, // Year-round
      'turnip': { plantingStart: 6, plantingEnd: 8, harvestStart: 9, harvestEnd: 11 }, // Jul-Sep planting, Oct-Dec harvest
      'beet': { plantingStart: 2, plantingEnd: 6, harvestStart: 5, harvestEnd: 9 }, // Mar-Jul planting, Jun-Oct harvest
      'beets': { plantingStart: 2, plantingEnd: 6, harvestStart: 5, harvestEnd: 9 },
      
      // Legumes
      'soybean': { plantingStart: 3, plantingEnd: 5, harvestStart: 8, harvestEnd: 10 }, // Apr-Jun planting, Sep-Nov harvest
      'soybeans': { plantingStart: 3, plantingEnd: 5, harvestStart: 8, harvestEnd: 10 },
      'chickpea': { plantingStart: 9, plantingEnd: 11, harvestStart: 2, harvestEnd: 4 }, // Oct-Dec planting, Mar-May harvest
      'chickpeas': { plantingStart: 9, plantingEnd: 11, harvestStart: 2, harvestEnd: 4 },
      'lentil': { plantingStart: 9, plantingEnd: 11, harvestStart: 2, harvestEnd: 4 }, // Oct-Dec planting, Mar-May harvest
      'lentils': { plantingStart: 9, plantingEnd: 11, harvestStart: 2, harvestEnd: 4 },
    };
    
    // Default seasons if crop not found
    const defaultSeasons = { plantingStart: 2, plantingEnd: 4, harvestStart: 6, harvestEnd: 8 };
    
    return seasonalCrops[cropType.toLowerCase()] || defaultSeasons;
  }, []);

  // Auto-populate planting and harvesting dates for crops that don't have them
  const autoPopulateCropDates = React.useCallback(async () => {
    if (!crops?.length || !updateCrop) return;
    
    for (const crop of crops) {
      if (!crop.plantingDate || !crop.expectedHarvestDate) {
        const seasons = getOptimalSeasons(crop.type);
        const currentYear = new Date().getFullYear();
        
        // Convert month indices to actual dates
        const plantingMonth = seasons.plantingStart;
        const harvestMonth = seasons.harvestStart;
        
        // Adjust year for harvest if it's in the following year
        const harvestYear = harvestMonth < plantingMonth ? currentYear + 1 : currentYear;
        
        const plantingDate = new Date(currentYear, plantingMonth, 15).toISOString().split('T')[0];
        const harvestDate = new Date(harvestYear, harvestMonth, 15).toISOString().split('T')[0];
        
        try {
          await updateCrop({
            id: crop._id,
            data: {
              plantingDate: crop.plantingDate || plantingDate,
              expectedHarvestDate: crop.expectedHarvestDate || harvestDate,
            }
          });
        } catch (error) {
          console.error('Error updating crop dates:', error);
        }
      }
    }
  }, [crops, updateCrop, getOptimalSeasons]);

  // Helper to get month index from date string (YYYY-MM-DD)
  const getMonthIndex = (dateStr?: string) => {
    if (!dateStr) return 0;
    const month = new Date(dateStr).getMonth();
    // Month index now matches standard calendar (Jan=0, Feb=1, etc.)
    return month;
  };

  // Auto-populate crop dates when crops are loaded
  useEffect(() => {
    autoPopulateCropDates();
  }, [autoPopulateCropDates]);

  useEffect(() => {
    if (!crops?.length) {
      setCropData([]);
      return;
    }
    
    const mappedCropData: CropSeason[] = crops.map((crop: any) => {
      let cropName = crop.name;
      cropName = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
      
      // Get optimal seasons for this crop type
      const optimalSeasons = getOptimalSeasons(crop.type);
      
      // Use actual dates if available, otherwise use optimal seasons
      let plantingStart = optimalSeasons.plantingStart;
      let plantingEnd = optimalSeasons.plantingEnd;
      let harvestStart = optimalSeasons.harvestStart;
      let harvestEnd = optimalSeasons.harvestEnd;
      
      if (crop.plantingDate) {
        plantingStart = plantingEnd = getMonthIndex(crop.plantingDate);
      }
      if (crop.expectedHarvestDate) {
        harvestStart = harvestEnd = getMonthIndex(crop.expectedHarvestDate);
      }
      
      return {
        crop: cropName,
        icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
        plantingStart,
        plantingEnd,
        harvestStart,
        harvestEnd
      };
    });
    
    setCropData(mappedCropData);
  }, [crops, getOptimalSeasons]);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  

  const renderBar = (crop: CropSeason, type: 'planting' | 'harvest') => {
    const start = type === 'planting' ? crop.plantingStart : crop.harvestStart;
    const end = type === 'planting' ? crop.plantingEnd : crop.harvestEnd;
    const color = type === 'planting' ? 'bg-green-500' : 'bg-orange-500';
    
    // Create a block for each month, using the same flex layout as headers
    return months.map((_, monthIndex) => {
      const isInRange = monthIndex >= start && monthIndex <= end;
      
      return (
        <div key={`${crop.crop}-${type}-${monthIndex}`} className="flex-1 px-1">
          {isInRange && (
            <div className={`h-4 ${color} rounded-sm opacity-80`} />
          )}
        </div>
      );
    });
  };
  
  const handleAddCrop = async () => {
    // Add new crop to the database
    if (convexUser) {
      try {
        const cropType = 'tomato'; // Default to tomato, user can edit later
        const optimalSeasons = getOptimalSeasons(cropType);
        const currentYear = new Date().getFullYear();
        
        // Convert month indices to actual dates
        const plantingMonth = optimalSeasons.plantingStart;
        const harvestMonth = optimalSeasons.harvestStart;
        
        // Adjust year for harvest if it's in the following year
        const harvestYear = harvestMonth < plantingMonth ? currentYear + 1 : currentYear;
        
        const plantingDate = new Date(currentYear, plantingMonth, 15).toISOString().split('T')[0];
        const harvestDate = new Date(harvestYear, harvestMonth, 15).toISOString().split('T')[0];
        
        await addCrop({
          userId: convexUser._id,
          name: `New Crop ${cropData.length + 1}`,
          type: cropType,
          category: 'vegetables',
          status: "planned",
          plantingDate,
          expectedHarvestDate: harvestDate,
        });
      } catch (error) {
        console.error(`Error adding crop:`, error);
      }
    }
  };
  
  const handleRemoveCrop = async (cropName: string) => {
    if (!crops?.length) return;
    
    // Find the crop in the database by name
    const cropToDelete = crops.find((crop: any) => 
      crop.name.toLowerCase() === cropName.toLowerCase()
    );
    
    if (!cropToDelete) {
      console.error('Crop not found:', cropName);
      return;
    }
    
    try {
      // Delete the crop from the database
      await deleteCrop({ id: cropToDelete._id });
      
      // The UI will automatically update through the useEffect that watches the crops data
    } catch (error) {
      console.error('Error deleting crop:', error);
    }
  };

  const containerClass = isFullPage ? "h-screen" : "h-80";

  return (
    <Card className={containerClass}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span>CROP CALENDAR</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              PLANTING SEASON
            </Badge>
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
              HARVEST SEASON
            </Badge>
            {isFullPage && (
              <Button size="sm" variant="outline" onClick={handleAddCrop}>
                <Plus className="w-4 h-4 mr-1" />
                Add Crop
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Grid container using CSS Grid for perfect alignment */}
          <div className="flex-1 overflow-y-auto">
            {/* Header row */}
            <div className="grid border-b bg-gray-50" style={{ gridTemplateColumns: '8rem repeat(12, 1fr)' }}>
              <div className="p-2 border-r bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">CROPS</span>
              </div>
              {months.map((month, index) => (
                <div key={month} className="p-1 text-center text-xs font-medium text-gray-600 border-r last:border-r-0">
                  {month}
                </div>
              ))}
            </div>

            {/* Crop rows */}
            {cropData.map((crop, index) => (
              <div key={crop.crop} className="grid border-b hover:bg-gray-50 transition-colors" style={{ gridTemplateColumns: '8rem repeat(12, 1fr)', minHeight: '48px' }}>
                <div className="p-3 border-r bg-white flex items-center space-x-2">
                  {crop.icon}
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {crop.crop}
                  </span>
                  {isFullPage && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="ml-auto p-1 h-5 w-5"
                      onClick={() => handleRemoveCrop(crop.crop)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {months.map((_, monthIndex) => (
                  <div key={monthIndex} className="border-r border-gray-200 last:border-r-0 relative flex items-center justify-center">
                    {/* Planting segment for this month */}
                    {crop.plantingStart <= monthIndex && monthIndex <= crop.plantingEnd && (
                      <div className="absolute top-1 left-1 right-1 h-4 bg-green-500 rounded-sm opacity-80" />
                    )}
                    {/* Harvesting segment for this month */}
                    {crop.harvestStart <= monthIndex && monthIndex <= crop.harvestEnd && (
                      <div className="absolute bottom-1 left-1 right-1 h-4 bg-orange-500 rounded-sm opacity-80" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};