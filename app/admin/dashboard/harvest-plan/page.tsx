'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from '@/components/dashboard/Header';
import { GanttCropCalendar } from '@/components/dashboard/GanttCropCalendar';
// ... other imports

export default function HarvestPlanPage() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Replace with actual user ID from authentication
  const userId = "user123" as any;
  
  // Fetch crops data for calendar
  const cropsData = useQuery(api.crops.getCropsForCalendar, {
    userId,
    year: selectedYear,
    cropType: selectedCrops[0] === 'all' ? undefined : selectedCrops[0],
    searchQuery: searchQuery || undefined,
  });

  const createCrop = useMutation(api.crops.createCrop);

  const handleAddCrop = async () => {
    // This would typically open a modal or form
    await createCrop({
      name: "New Crop",
      type: "maize",
      category: "grains",
      userId,
      plantingDate: new Date().toISOString(),
    });
  };

  const years = ['2023', '2024', '2025'];
  const cropTypes = ['All Crops', 'Grains', 'Vegetables', 'Fruits', 'Root Crops'];

  // Calculate active crops counts
  const activePlanting = cropsData?.filter(crop => crop.status === 'planted').length || 0;
  const scheduledHarvest = cropsData?.filter(crop => crop.status === 'ready_to_harvest').length || 0;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none">
        <Header />
      </div>
      
      {/* Page Header with Controls */}
      <div className="flex-none bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Harvest Planning</h1>
              <p className="text-sm text-muted-foreground">
                Plan and manage your crop planting and harvest schedules
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Plan
              </Button>
              
              <Button size="sm" onClick={handleAddCrop}>
                <Plus className="w-4 h-4 mr-2" />
                Add Crop
              </Button>
            </div>
          </div>
          
          {/* Rest of your existing filters code */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search and filters remain the same */}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Planting: {activePlanting} Active
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
                Harvest: {scheduledHarvest} Scheduled
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Calendar Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full">
          <GanttCropCalendar 
            isFullPage={true} 
            cropsData={cropsData}
          />
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="flex-none bg-white border-t px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Total Crops: {cropsData?.length || 0}</span>
            <span>Active Seasons: {activePlanting} Planting, {scheduledHarvest} Harvest</span>
            <span>Last Updated: Today, 2:30 PM</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Calendar Settings
            </Button>
            
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              View Month
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}