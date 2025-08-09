'use client';

<<<<<<< Updated upstream
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
=======
import React, { useState } from 'react';
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { GanttCropCalendar } from '@/components/dashboard/GanttCropCalendar';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { HarvestGrowthChart } from '@/components/dashboard/HarvestGrowthChart';
import { SeedStock } from '@/components/dashboard/SeedStock';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
>>>>>>> Stashed changes

export default function DashboardPage() {
  // Replace with actual user ID from authentication
  const userId = "k57e13kzazx6j1pqyjg7m0mjcx7n85zt" as any; // This should come from your auth system
  
  const dashboardStats = useQuery(api.crops.getDashboardStats, { userId });

  if (!dashboardStats) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
<<<<<<< Updated upstream
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#783121]">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your farm management dashboard
        </p>
=======
    <div className="flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="flex-none">
        {/* Header with search and user auth */}
        <div className="p-4 bg-white border-b flex justify-between items-center">
          {/* Search Function - left aligned */}
          <div className="flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Search crops, tasks, or reports..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {/* Clerk Authentication */}
          <div className="ml-4">
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-[#783121] mb-2">Total Fields</h3>
          <p className="text-3xl font-bold text-[#39883E]">{dashboardStats.totalFields}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-[#783121] mb-2">Active Crops</h3>
          <p className="text-3xl font-bold text-[#39883E]">{dashboardStats.activeCrops}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-[#783121] mb-2">Water Usage</h3>
          <p className="text-3xl font-bold text-[#39883E]">{dashboardStats.waterUsage}k L</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-[#783121] mb-2">Equipment</h3>
          <p className="text-3xl font-bold text-[#39883E]">{dashboardStats.equipment}</p>
        </div>
      </div>
    </div>
  );
}