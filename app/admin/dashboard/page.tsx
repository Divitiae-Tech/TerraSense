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

  const mapConditionIcon = (iconCode: string): 'sunny' | 'cloudy' | 'rainy' => {
    switch (iconCode) {
      case 'sunny':
        return 'sunny';
      case 'rainy':
        return 'rainy';
      case 'cloudy':
      default:
        return 'cloudy';
    }
  };

  const formatForecastDay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  useEffect(() => {
    const latitude = -33.9321;
    const longitude = 18.8602;

    const fetchWeatherData = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      try {
        const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch weather data');
        }
        const result = await response.json();

        const transformedWeather: WeatherData = {
          current: {
            temp: Math.round(result.current?.temperature ?? 0),
            condition: result.current?.condition?.summary ?? 'Clear',
            humidity: Math.round(result.current?.humidity ?? 0),
            wind: Math.round(result.current?.wind?.speed ?? 0)
          },
          forecast: result.daily?.slice(0, 7).map((day: any) => ({
            day: formatForecastDay(day.date),
            temp: Math.round(day.temperatureMax ?? day.temperature?.max ?? 0),
            condition: mapConditionIcon(day.condition?.icon ?? 'cloudy'),
            rain: Math.round((day.precipitation?.total ?? 0) * 100) / 100
          })) || []
        };

        setWeather(transformedWeather);
      } catch (error) {
        setWeatherError(error instanceof Error ? error.message : 'Failed to load weather data');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

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
    <div className="flex flex-col bg-gray-50">
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
      <div className="flex-none border-b bg-white">
        <DashboardControls
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>
      <div className="flex-1 p-6 ">
        <div className="h-full flex flex-col gap-6">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
              <GanttCropCalendar />
            </div>
            <div className="lg:col-span-1">
              <AIAssistant aiPrompts={aiPrompts} />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {weatherError ? (
                <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-red-500">Weather Error</p>
                    <p className="text-gray-500 text-sm">{weatherError}</p>
                  </div>
                </div>
              ) : weather ? (
                <WeatherWidget weather={weather} />
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
