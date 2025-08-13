// /components/waterusage/WaterUsageDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Droplets, AlertTriangle, CheckCircle, Calendar, MapPin, 
  RefreshCw, Filter, Download, Plus, Settings
} from 'lucide-react';
import { FarmSelector } from './FarmSelector';
import { WaterSummaryCards } from './WaterSummaryCards';
import { WaterUsageChart } from './WaterUsageChart';
import { WaterUsageTable } from './WaterUsageTable';
import { WaterUsageAlerts } from './WaterUsageAlerts';

// ====================== DATABASE INTEGRATION NOTES ======================
// This component expects data from backend APIs with these endpoints:
// - GET /api/farms - List of all farms
// - GET /api/farms/{id}/water-usage - Water usage history for a specific farm
// - GET /api/farms/{id}/systems - Irrigation system data
// - GET /api/farms/{id}/alerts - Current alerts for a farm
// ========================================================================

// ====================== AI MODEL INTEGRATION NOTES ======================
// The following data structures are suitable for machine learning:
// 1. WaterUsageDataPoint array for time-series prediction models
// 2. CropWaterUsage data for clustering algorithms
// 3. IrrigationSystem data for performance optimization models
// ========================================================================

// Types for TypeScript support
interface Farm {
  id: string;
  name: string;
  location: string;
}

interface WaterUsageDataPoint {
  date: string;           // Date string (e.g., "Mon", "2023-06-01")
  usage: number;          // Water usage in cubic meters
  efficiency: number;     // Efficiency percentage (0-100)
}

interface WaterUsageSummary {
  totalUsage: number;
  avgDailyUsage: number;
  efficiency: number;
  alerts: number;
  savings: number;
}

interface CropWaterUsage {
  crop: string;
  usage: number;
  percentage: number;
}

interface IrrigationSystem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'warning';
  usage: number;
  efficiency: number;
}

// ====================== MOCK DATA FOR DEMONSTRATION ======================
// In production, this data would come from database/API calls
// For AI/ML purposes, this represents sample data patterns
const farms: Farm[] = [
  { id: 'farm-1', name: 'Green Valley Farm', location: 'California, USA' },
  { id: 'farm-2', name: 'Sunshine Acres', location: 'Texas, USA' },
  { id: 'farm-3', name: 'Riverbank Ranch', location: 'Colorado, USA' },
];

const waterUsageHistory: WaterUsageDataPoint[] = [
  { date: 'Mon', usage: 120, efficiency: 85 },
  { date: 'Tue', usage: 145, efficiency: 78 },
  { date: 'Wed', usage: 130, efficiency: 92 },
  { date: 'Thu', usage: 160, efficiency: 88 },
  { date: 'Fri', usage: 155, efficiency: 90 },
  { date: 'Sat', usage: 140, efficiency: 87 },
  { date: 'Sun', usage: 135, efficiency: 91 },
];

const cropWaterUsage: CropWaterUsage[] = [
  { crop: 'Corn', usage: 45, percentage: 35 },
  { crop: 'Wheat', usage: 30, percentage: 23 },
  { crop: 'Soybeans', usage: 25, percentage: 19 },
  { crop: 'Cotton', usage: 20, percentage: 15 },
  { crop: 'Other', usage: 10, percentage: 8 },
];

const irrigationSystems: IrrigationSystem[] = [
  { id: 'sys-1', name: 'Drip System A', status: 'active', usage: 45, efficiency: 92 },
  { id: 'sys-2', name: 'Sprinkler System B', status: 'warning', usage: 60, efficiency: 78 },
  { id: 'sys-3', name: 'Center Pivot C', status: 'active', usage: 75, efficiency: 85 },
  { id: 'sys-4', name: 'Flood Irrigation', status: 'inactive', usage: 30, efficiency: 65 },
];

/**
 * Main Water Usage Dashboard Component
 * 
 * This component serves as the primary interface for monitoring water consumption
 * in agricultural operations. It combines various visualizations and data displays
 * to provide comprehensive insights into water usage patterns.
 * 
 * @param props - Component properties (none expected)
 * @returns JSX element representing the dashboard
 */
export const WaterUsageDashboard = () => {
  // State management for interactive elements
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'alerts'>('overview');
  const [selectedFarm, setSelectedFarm] = useState<string>('farm-1');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [waterSummary, setWaterSummary] = useState<WaterUsageSummary>({
    totalUsage: 1050,
    avgDailyUsage: 150,
    efficiency: 85,
    alerts: 2,
    savings: 45,
  });

  // Simulate data loading (in production, this would fetch from API)
  useEffect(() => {
    // In a real application, this would call API endpoints:
    // - fetchFarms()
    // - fetchWaterUsage(selectedFarm)
    // - fetchIrrigationSystems(selectedFarm)
    console.log('Loading water usage data for farm:', selectedFarm);
  }, [selectedFarm]);

  /**
   * Handle refresh button click
   * In production, this would trigger API calls to refresh data
   */
  const handleRefresh = () => {
    console.log('Refreshing water usage data...');
    // TODO: Implement actual data refresh logic
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header section with title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Water Usage Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your agricultural water consumption</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Farm Selector - Allows switching between different farm locations */}
      <FarmSelector 
        farms={farms} 
        selectedFarm={selectedFarm} 
        onSelectFarm={setSelectedFarm} 
      />

      {/* Summary Cards - Key metrics at a glance */}
      <WaterSummaryCards summary={waterSummary} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Usage Chart - Shows trends over time */}
        <div className="lg:col-span-2">
          <WaterUsageChart 
            data={waterUsageHistory} 
            timeRange={timeRange} 
            onTimeRangeChange={setTimeRange} 
          />
        </div>

        {/* Crop Efficiency Visualization */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Water Efficiency by Crop</CardTitle>
              <CardDescription>Distribution of water usage across crops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Droplets className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                  <p className="text-muted-foreground">Crop efficiency visualization</p>
                  <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Irrigation Systems Table */}
        <div className="lg:col-span-3">
          <WaterUsageTable systems={irrigationSystems} />
        </div>
      </div>

      {/* Tabbed Interface for Different Views */}
      <div className="mt-6">
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts & Recommendations
          </button>
        </div>

        {/* Tab Content Sections */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Water Usage</CardTitle>
                <CardDescription>Latest measurements and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Field {item}</div>
                        <div className="text-sm text-muted-foreground">Yesterday's usage</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">120 m³</div>
                        <div className="text-sm text-muted-foreground">+12% from last week</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Water Conservation Tips</CardTitle>
                <CardDescription>Recommendations to improve efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Implement soil moisture sensors to optimize watering schedules</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Use drip irrigation instead of sprinklers for better water efficiency</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Install weather-based irrigation controllers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Regular maintenance of irrigation equipment to prevent leaks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Water Analytics</CardTitle>
              <CardDescription>Comprehensive analysis of water usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Usage by Field</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                      <p className="text-muted-foreground">Field usage visualization</p>
                      <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Monthly Comparison</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <p className="text-muted-foreground">Monthly analytics</p>
                      <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'alerts' && <WaterUsageAlerts />}
      </div>
    </div>
  );
};