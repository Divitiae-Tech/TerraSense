// components/finance/ProfitLossChart.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SecureDataHandler } from '@/lib/secureDataHandler';
import { Badge } from '../ui/badge';

interface ProfitLossChartProps {
  dateRange: string;
}

const ProfitLossChart = ({ dateRange }: ProfitLossChartProps) => {
  const mockData = [
    { date: 'Jan', profit: 4000, income: 25000, expenses: 21000 },
    { date: 'Feb', profit: -2000, income: 18000, expenses: 20000 },
    { date: 'Mar', profit: 3000, income: 23000, expenses: 20000 },
    { date: 'Apr', profit: 5000, income: 30000, expenses: 25000 },
    { date: 'May', profit: -1000, income: 19000, expenses: 20000 },
    { date: 'Jun', profit: 7000, income: 32000, expenses: 25000 },
    { date: 'Jul', profit: 6000, income: 35000, expenses: 29000 },
    { date: 'Aug', profit: 9000, income: 40000, expenses: 31000 },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profit & Loss Over Time</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="outline">📈 Trending Analysis</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, name) => [`R${SecureDataHandler.maskFinancialData(Number(value))}`, name]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={3}
              name="Income"
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={3}
              name="Expenses"
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              strokeWidth={4}
              name="Net Profit"
              dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProfitLossChart;