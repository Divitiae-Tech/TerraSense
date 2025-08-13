'use client';
import { useAIAssistant } from '../../hooks/useAIAssistant';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  Tractor, 
  Sun, 
  Cloud, 
  CloudRain, 
  Droplets,
  Settings,
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
  const addCrop = useMutation(api.aiAssistant.addCrop);
  const crops = useQuery(
    api.aiAssistant.getUserCrops,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const cropCalendars = useQuery(
    api.aiAssistant.getUserCropCalendars,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  // --- AI Assistant Crop Calendar Management ---
  const { messages, parseCalendarUpdate } = useAIAssistant();
  const upsertCropCalendar = useMutation(api.aiAssistant.upsertCropCalendar);
  // Placeholder for remove mutation (implement in Convex backend)
  // const removeCropCalendar = useMutation(api.aiAssistant.removeCropCalendar);
  const findCropByName = (name: string) => crops?.find((c: any) => c.name.toLowerCase() === name.toLowerCase());

  // Helper to get month index from date string (YYYY-MM-DD)
  const getMonthIndex = (dateStr?: string) => {
    if (!dateStr) return 0;
    const month = new Date(dateStr).getMonth();
  // Adjust for calendar months array (starts at MAR) 
    return (month + 9) % 12;
  };

  useEffect(() => {
    if (!cropCalendars || !crops) return;
    
    const mappedCropData: CropSeason[] = cropCalendars.map((calendar: any) => {
      const crop = crops.find((c: any) => c._id === calendar.cropId);
      let cropName = crop ? crop.name : calendar.cropId;
      cropName = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
      
      // Find planting and harvesting dates from schedule
      const plantingAction = calendar.schedule?.find((s: any) => s.action === 'planting');
      const harvestAction = calendar.schedule?.find((s: any) => s.action === 'harvesting');
      
      return {
        crop: cropName,
        icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
        plantingStart: getMonthIndex(plantingAction?.date),
        plantingEnd: getMonthIndex(plantingAction?.date),
        harvestStart: getMonthIndex(harvestAction?.date),
        harvestEnd: getMonthIndex(harvestAction?.date)
      };
    });
    
    setCropData(mappedCropData);
  }, [cropCalendars, crops]);

  const months = ['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'];
  
  const weatherData = [
    { temp: 24, icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { temp: 26, icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { temp: 27, icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { temp: 25, icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { temp: 22, icon: <Cloud className="w-4 h-4 text-gray-500" /> },
    { temp: 20, icon: <Cloud className="w-4 h-4 text-gray-500" /> },
    { temp: 18, icon: <CloudRain className="w-4 h-4 text-blue-500" /> },
    { temp: 16, icon: <CloudRain className="w-4 h-4 text-blue-500" /> },
    { temp: 19, icon: <CloudRain className="w-4 h-4 text-blue-500" /> },
    { temp: 21, icon: <Cloud className="w-4 h-4 text-gray-500" /> },
    { temp: 23, icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { temp: 25, icon: <Sun className="w-4 h-4 text-yellow-500" /> }
  ];

  const renderBar = (crop: CropSeason, type: 'planting' | 'harvest') => {
    const start = type === 'planting' ? crop.plantingStart : crop.harvestStart;
    const end = type === 'planting' ? crop.plantingEnd : crop.harvestEnd;
    const color = type === 'planting' ? 'bg-green-500' : 'bg-orange-500';
    
    const segments = [];
    let currentStart = start;
    
    while (currentStart <= end) {
      const segmentEnd = Math.min(end, currentStart === start ? end : currentStart);
      const width = ((segmentEnd - currentStart + 1) / 12) * 100;
      const left = (currentStart / 12) * 100;
      
      segments.push(
        <div
          key={`${crop.crop}-${type}-${currentStart}`}
          className={`absolute h-4 ${color} rounded-sm opacity-80`}
          style={{
            left: `${left}%`,
            width: `${width}%`
          }}
        />
      );
      currentStart = segmentEnd + 1;
    }
    
    return segments;
  };
  
  const handleAddCrop = async () => {
    // Add new crop to the database
    if (convexUser) {
      try {
        await addCrop({
          userId: convexUser._id,
          name: `New Crop ${cropData.length + 1}`,
          type: `newcrop${cropData.length + 1}`.toLowerCase(),
          status: "planned",
        });
      } catch (error) {
        console.error(`Error adding crop:`, error);
      }
    }
    
    // Update the crop data state with added crop
    const newCrop: CropSeason = {
      crop: `New Crop ${cropData.length + 1}`,
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 0,
      plantingEnd: 2,
      harvestStart: 6,
      harvestEnd: 8
    };
    setCropData(prev => [...prev, newCrop]);
  };
  
  const handleRemoveCrop = (cropName: string) => {
    setCropData(prev => prev.filter(crop => crop.crop !== cropName));
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
          {/* Header with months and settings */}
          <div className="flex border-b bg-gray-50">
            <div className="w-32 p-2 border-r bg-gray-100 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600" />
            </div>
            {months.map((month, index) => (
              <div key={month} className="flex-1 p-2 text-center text-xs font-medium text-gray-600 border-r">
                {month}
              </div>
            ))}
          </div>

          {/* Weather row */}
          <div className="flex border-b bg-gray-50">
            <div className="w-32 p-2 border-r text-xs font-medium text-gray-600 flex items-center">
              <Sun className="w-4 h-4 mr-1" />
              WEATHER
            </div>
            {weatherData.map((weather, index) => (
              <div key={index} className="flex-1 p-2 text-center border-r flex flex-col items-center justify-center">
                {weather.icon}
                <span className="text-xs text-gray-600 mt-1">{weather.temp}°</span>
              </div>
            ))}
          </div>

          {/* Crops */}
          <div className="flex-1 overflow-y-auto">
            {cropData.map((crop, index) => (
              <div key={crop.crop} className="flex border-b hover:bg-gray-50 transition-colors">
                <div className="w-32 p-3 border-r bg-white flex items-center space-x-2">
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
                <div className="flex-1 relative" style={{ minHeight: '48px' }}>
                  <div className="absolute inset-0 flex">
                    {months.map((_, monthIndex) => (
                      <div key={monthIndex} className="flex-1 border-r border-gray-200" />
                    ))}
                  </div>
                  <div className="absolute inset-0 p-2">
                    {renderBar(crop, 'planting')}
                    {renderBar(crop, 'harvest')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weather forecast at bottom if full page */}
          {isFullPage && (
            <div className="border-t bg-gray-900 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sun className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="text-lg font-bold">24°C</div>
                    <div className="text-xs text-gray-400">Mostly Sunny</div>
                  </div>
                </div>
                <div className="flex space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-4 h-4" />
                    <span>65% Humidity</span>
                  </div>
                  <div>Wind: 12 km/h</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};