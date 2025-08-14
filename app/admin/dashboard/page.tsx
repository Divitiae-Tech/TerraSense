'use client';

import React, { useState, useEffect } from 'react';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { GanttCropCalendar } from '@/components/dashboard/GanttCropCalendar';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { AIAssistantModal } from '@/components/dashboard/AIAssistantModal';
import { HarvestGrowthChart } from '@/components/dashboard/HarvestGrowthChart';
import { SeedStock } from '@/components/dashboard/SeedStock';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { MessageSquare } from 'lucide-react';

// Type definitions for weather data
interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

interface ForecastDay {
  day: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  rain: number;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export default function DashboardPage() {
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Get user and crops from Convex
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const crops = useQuery(
    api.aiAssistant.getUserCrops,
    convexUser && convexUser._id ? { userId: convexUser._id } : "skip"
  ) || [];

  // AI Assistant shared state, pass crops for ID replacement
  const { messages, isLoading, error, handleSubmit, parseCalendarUpdate } = useAIAssistant(crops);
  const upsertCropCalendar = useMutation(api.aiAssistant.upsertCropCalendar);
  const addCrop = useMutation(api.aiAssistant.addCrop);

  // Listen for AI calendar update instructions and trigger upsertCropCalendar
  React.useEffect(() => {
    if (!messages || messages.length === 0 || !convexUser || !crops) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'model') {
      const { addedCrops } = parseCalendarUpdate(lastMsg.text);
      if (addedCrops && addedCrops.length > 0) {
        (async () => {
          for (const cropName of addedCrops) {
            let crop = crops.find((c) => c.name.toLowerCase() === cropName.toLowerCase());
            if (!crop) {
              try {
                const cropId = await addCrop({
                  userId: convexUser._id,
                  name: cropName,
                  type: 'unknown',
                  status: 'planned',
                });
                crop = {
                  _id: cropId,
                  name: cropName,
                  userId: convexUser._id,
                  type: 'unknown',
                  status: 'planned',
                  _creationTime: Date.now(),
                  createdAt: Date.now(),
                };
              } catch (err) {
                console.error('Error adding crop:', err);
              }
            }
            if (crop) {
              try {
                const today = new Date();
                const schedule = [
                  {
                    date: today.toISOString().split('T')[0],
                    action: 'planting',
                    description: 'Plant seeds',
                    completed: false,
                  },
                ];
                await upsertCropCalendar({
                  userId: convexUser._id,
                  cropId: crop._id,
                  season: `${today.getFullYear()}-spring`,
                  schedule,
                });
              } catch (err) {
                console.error('Error upserting crop calendar:', err);
              }
            }
          }
        })();
      }
    }
  }, [messages, crops, convexUser]);
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

  return (
    <div className="flex flex-col bg-gray-50 h-screen">
      {/* Fixed Header - Simplified without auth components */}
      <div className="flex-none">
        <div className="p-4 bg-white border-b">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search crops, tasks, or reports..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
                messages={messages}
                isLoading={isLoading}
                error={error}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {weather ? (
                <WeatherWidget 
                  weather={weather} 
                //  loading={weatherLoading}
               //   error={weatherError}
                />
              ) : (
                <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading weather...</p>
                  </div>
                </div>
              )}
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

      {/* Floating button to open AI Assistant Modal */}
      <button
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* The modal is correctly placed inside the main return div */}
      <AIAssistantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aiPrompts={aiPrompts}
        messages={messages}
        isLoading={isLoading}
        error={error}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}