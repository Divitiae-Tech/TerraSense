'use client';

import React, { useState, useCallback } from 'react';
import { TrendingUp, Expand } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HarvestGrowthModal } from './HarvestGrowthModal';

interface HarvestData {
  month: string;
  harvest: number;
  growth: number;
}

interface CropDataPoint {
  month: string;
  [cropName: string]: string | number;
}

interface Crop {
  id: string;
  name: string;
  color: string;
}

interface HarvestGrowthChartProps {
  harvestData?: HarvestData[];
}

export const HarvestGrowthChart = ({ harvestData }: HarvestGrowthChartProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<HarvestData[]>([
    { month: 'Jan', harvest: 295, growth: 15 }, // 120+80+95
    { month: 'Feb', harvest: 340, growth: 22 }, // 135+95+110  
    { month: 'Mar', harvest: 410, growth: 35 }, // 165+120+125
    { month: 'Apr', harvest: 450, growth: 28 }, // 180+140+130
    { month: 'May', harvest: 530, growth: 45 }, // 220+160+150
    { month: 'Jun', harvest: 660, growth: 52 }, // 280+200+180
  ]);

  const handleModalDataChange = useCallback((chartData: CropDataPoint[], crops: Crop[]) => {
    // Calculate aggregated totals from modal data
    const newAggregatedData = chartData.map((dataPoint) => {
      const totalHarvest = crops.reduce((sum, crop) => {
        return sum + (dataPoint[crop.name] as number || 0);
      }, 0);
      
      return {
        month: dataPoint.month,
        harvest: totalHarvest,
        growth: 0, // We'll calculate growth rate based on previous month
      };
    });

    // Calculate growth rates
    for (let i = 1; i < newAggregatedData.length; i++) {
      const current = newAggregatedData[i].harvest;
      const previous = newAggregatedData[i - 1].harvest;
      newAggregatedData[i].growth = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
    }

    setAggregatedData(newAggregatedData);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Total Harvest Growth</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Expand chart"
            >
              <Expand className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          </CardTitle>
        </CardHeader>
      
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-sm"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-sm"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="harvest"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>Total Harvest: {aggregatedData.reduce((sum, item) => sum + item.harvest, 0)} kg</span>
          <span>Avg. Growth: {Math.round(aggregatedData.reduce((sum, item) => sum + item.growth, 0) / aggregatedData.length)}%</span>
        </div>
      </CardContent>
    </Card>

    <HarvestGrowthModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onDataChange={handleModalDataChange}
    />
  </>
  );
};