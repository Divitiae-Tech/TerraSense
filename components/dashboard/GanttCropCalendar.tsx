'use client';

import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';

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
  const [selectedSeason, setSelectedSeason] = useState<'PLANTING' | 'HARVEST'>('PLANTING');

  const months = ['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'];
  
  const cropData: CropSeason[] = [
    {
      crop: 'Long Grain Rice',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 0, // March
      plantingEnd: 2,   // May
      harvestStart: 7,  // October
      harvestEnd: 9     // December
    },
    {
      crop: 'Sugar Beet',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 0, // March
      plantingEnd: 1,   // April
      harvestStart: 6,  // September
      harvestEnd: 8     // November
    },
    {
      crop: 'Sugarcane',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 1, // April
      plantingEnd: 2,   // May
      harvestStart: 9,  // December
      harvestEnd: 11    // February
    },
    {
      crop: 'Cotton',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 0, // March
      plantingEnd: 3,   // June
      harvestStart: 5,  // August
      harvestEnd: 8     // November
    },
    {
      crop: 'Sorghum',
      icon: <div className="w-2 h-2 bg-orange-500 rounded-full" />,
      plantingStart: 2, // May
      plantingEnd: 4,   // July
      harvestStart: 7,  // October
      harvestEnd: 9     // December
    },
    {
      crop: 'Grapes',
      icon: <div className="w-2 h-2 bg-orange-500 rounded-full" />,
      plantingStart: 1, // April
      plantingEnd: 4,   // July
      harvestStart: 6,  // September
      harvestEnd: 9     // December
    },
    {
      crop: 'Olives',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 0, // March
      plantingEnd: 5,   // August
      harvestStart: 6,  // September
      harvestEnd: 8     // November
    },
    {
      crop: 'Poplar',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 3, // June
      plantingEnd: 4,   // July
      harvestStart: 8,  // November
      harvestEnd: 11    // February
    },
    {
      crop: 'Red Beet',
      icon: <div className="w-2 h-2 bg-orange-500 rounded-full" />,
      plantingStart: 4, // July
      plantingEnd: 6,   // September
      harvestStart: 8,  // November
      harvestEnd: 11    // February
    },
    {
      crop: 'Canola',
      icon: <div className="w-2 h-2 bg-orange-500 rounded-full" />,
      plantingStart: 4, // July
      plantingEnd: 7,   // October
      harvestStart: 9,  // December
      harvestEnd: 11    // February
    },
    {
      crop: 'Parsnips',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
      plantingStart: 0, // March
      plantingEnd: 2,   // May
      harvestStart: 7,  // October
      harvestEnd: 11    // February
    }
  ];

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
              <Button size="sm" variant="outline">
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