'use client';

import React, { useState } from 'react';
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { GanttCropCalendar } from '@/components/dashboard/GanttCropCalendar';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { AIAssistantModal } from '@/components/dashboard/AIAssistantModal';
import { HarvestGrowthChart } from '@/components/dashboard/HarvestGrowthChart';
import { SeedStock } from '@/components/dashboard/SeedStock';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';

export default function DashboardPage() {
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data
  const harvestData = [
    { month: 'Jan', harvest: 120, growth: 15 },
    { month: 'Feb', harvest: 135, growth: 22 },
    { month: 'Mar', harvest: 165, growth: 35 },
    { month: 'Apr', harvest: 180, growth: 28 },
    { month: 'May', harvest: 220, growth: 45 },
    { month: 'Jun', harvest: 280, growth: 52 }
  ];

  const seedStockData = [
    { name: 'Tomato Seeds', current: 85, max: 100 },
    { name: 'Corn Seeds', current: 60, max: 100 },
    { name: 'Wheat Seeds', current: 40, max: 100 },
    { name: 'Fertilizer', current: 25, max: 100 }
  ];

  const aiPrompts = [
    "What's the optimal watering schedule for my current crops?",
    "Analyze soil conditions and recommend fertilizers",
    "Predict harvest yield based on current growth"
  ];

  const weather = {
    current: { temp: 24, condition: 'Sunny', humidity: 65, wind: 12 },
    forecast: [
      { day: 'Today', temp: 24, condition: 'sunny' as const, rain: 0 },
      { day: 'Tomorrow', temp: 22, condition: 'cloudy' as const, rain: 2 },
      { day: 'Wednesday', temp: 26, condition: 'sunny' as const, rain: 0 },
      { day: 'Thursday', temp: 23, condition: 'rainy' as const, rain: 8 },
      { day: 'Friday', temp: 25, condition: 'sunny' as const, rain: 0 },
      { day: 'Saturday', temp: 27, condition: 'sunny' as const, rain: 0 },
      { day: 'Sunday', temp: 24, condition: 'cloudy' as const, rain: 1 }
    ]
  };

  return (
    <div className="flex flex-col bg-gray-50 h-screen">
      {/* Fixed Header */}
      <div className="flex-none">
        <div className="p-4 bg-white border-b flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search crops, tasks, or reports..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="ml-4">
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Fixed Dashboard Controls */}
      <div className="flex-none border-b bg-white">
        <DashboardControls
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>

      {/* Main Content Area - Scrolls */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="h-full flex flex-col gap-6">
          {/* Top Row */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
              <GanttCropCalendar />
            </div>
            {/* This is the key change: min-h-0 is added to the parent div */}
            <div className="lg:col-span-1 min-h-0">
              <AIAssistant
                aiPrompts={aiPrompts}
                onFirstInteraction={() => setIsModalOpen(true)}
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <WeatherWidget weather={weather} />
            </div>
            <div className="lg:col-span-1">
              <SeedStock seedStockData={seedStockData} />
            </div>
            <div className="lg:col-span-1">
              <HarvestGrowthChart harvestData={harvestData} />
            </div>
          </div>
        </div>
      </div>

      {/* The modal is correctly placed inside the main return div */}
      <AIAssistantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}