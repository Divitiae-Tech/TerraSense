// components/dashboard/GanttCropCalendar.tsx
'use client';

import React from 'react';

interface CropData {
  _id: string;
  name: string;
  type: string;
  status: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  calendar?: {
    schedule: Array<{
      date: string;
      action: string;
      completed: boolean;
      description?: string;
    }>;
  };
}

interface GanttCropCalendarProps {
  isFullPage?: boolean;
  cropsData?: CropData[];
}

export function GanttCropCalendar({ isFullPage = false, cropsData = [] }: GanttCropCalendarProps) {
  const generateTimelineData = () => {
    return cropsData.map(crop => ({
      id: crop._id,
      name: crop.name,
      type: crop.type,
      status: crop.status,
      plantingDate: crop.plantingDate,
      harvestDate: crop.expectedHarvestDate,
      tasks: crop.calendar?.schedule.map(task => ({
        ...task,
        cropId: crop._id,
      })) || [],
    }));
  };

  const timelineData = generateTimelineData();

  return (
    <div className={`bg-white rounded-lg shadow ${isFullPage ? 'h-full' : 'h-96'}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Crop Planning Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Track planting and harvest schedules across all your crops
        </p>
      </div>
      
      <div className="p-4 overflow-auto">
        {timelineData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No crops data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add some crops to see your planning timeline
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelineData.map(crop => (
              <div key={crop.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{crop.name} ({crop.type})</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    crop.status === 'planted' ? 'bg-green-100 text-green-800' :
                    crop.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                    crop.status === 'ready_to_harvest' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {crop.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {crop.plantingDate && (
                    <span>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</span>
                  )}
                  {crop.harvestDate && (
                    <span className="ml-4">
                      Expected Harvest: {new Date(crop.harvestDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {crop.tasks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {crop.tasks.slice(0, 3).map((task, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          task.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span>{task.action}</span>
                        <span className="ml-auto text-muted-foreground">
                          {new Date(task.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {crop.tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{crop.tasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}