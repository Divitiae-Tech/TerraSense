// components/finance/ExpenseBreakdownChart.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SecureDataHandler } from '@/lib/secureDataHandler';

interface ExpenseBreakdownChartProps {
  dateRange: string;
  transactions?: any[];
}

const ExpenseBreakdownChart = ({ dateRange, transactions }: ExpenseBreakdownChartProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const mockData = [
    { id: 'fertilizer', name: 'Fertilizer', value: 25000, percentage: 35.7 },
    { id: 'seeds', name: 'Seeds', value: 15000, percentage: 21.4 },
    { id: 'labor', name: 'Labor', value: 20000, percentage: 28.6 },
    { id: 'fuel', name: 'Fuel', value: 10000, percentage: 14.3 },
  ];

  const CustomTooltip = ({ active, payload }: { active: boolean; payload: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            R{isClient ? SecureDataHandler.maskFinancialData(data.value) : data.value} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <p className="text-sm text-gray-500">Total: R70,000</p>
      </CardHeader>
      <CardContent className="h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              isAnimationActive={true}
            >
              {mockData.map((entry, index) => (
                <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip active={false} payload={[]} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {mockData.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-xs text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdownChart;