'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  // Replace with actual user ID from authentication
  const userId = "k57e13kzazx6j1pqyjg7m0mjcx7n85zt" as any; // This should come from your auth system
  
  const dashboardStats = useQuery(api.crops.getDashboardStats, { userId });

  if (!dashboardStats) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#783121]">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your farm management dashboard
        </p>
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