// /components/waterusage/WaterUsageChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Droplets } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// Expected data structure from backend:
// WaterUsageDataPoint array with:
// - date: string (e.g., "Mon", "2023-06-01")
// - usage: number (water usage in m³)
// - efficiency: number (efficiency percentage)
// ========================================================================

// ====================== AI MODEL INTEGRATION NOTES ======================
// This chart data is ideal for:
// - Time-series forecasting models
// - Anomaly detection algorithms
// - Trend analysis for predictive maintenance
// ========================================================================

/**
 * Water Usage Chart Component
 * 
 * Interactive chart showing water usage trends over time with dual axes.
 * Users can toggle between different time ranges for analysis.
 * 
 * @param props - Component properties
 * @returns JSX element representing the chart
 */
interface WaterUsageDataPoint {
  date: string;           // Date string (e.g., "Mon", "2023-06-01")
  usage: number;          // Water usage in cubic meters
  efficiency: number;     // Efficiency percentage (0-100)
}

interface WaterUsageChartProps {
  data: WaterUsageDataPoint[];     // Chart data points
  timeRange: 'day' | 'week' | 'month'; // Current time range filter
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void; // Callback for time range change
}

export const WaterUsageChart = ({ data, timeRange, onTimeRangeChange }: WaterUsageChartProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Water Usage Trends</CardTitle>
            <CardDescription>Weekly water consumption patterns</CardDescription>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            <Button 
              variant={timeRange === 'day' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onTimeRangeChange('day')}
            >
              Day
            </Button>
            <Button 
              variant={timeRange === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onTimeRangeChange('week')}
            >
              Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onTimeRangeChange('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Container */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              {/* Grid lines for better readability */}
              <CartesianGrid strokeDasharray="3 3" />
              
              {/* X-axis configuration */}
              <XAxis dataKey="date" />
              
              {/* Y-axis configuration */}
              <YAxis />
              
              {/* Tooltips for detailed information */}
              <Tooltip />
              
              {/* Legend for chart series */}
              <Legend />
              
              {/* Water usage line (blue) */}
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#3b82f6" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
                name="Water Usage (m³)"
              />
              
              {/* Efficiency line (green) */}
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Efficiency (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};