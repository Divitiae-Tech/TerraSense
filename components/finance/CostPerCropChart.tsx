// components/finance/CostPerCropChart.tsx
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { SecureDataHandler } from "@/lib/secureDataHandler";

interface CostPerCropChartProps {
  dateRange: string;
}

const CostPerCropChart = ({ dateRange }: CostPerCropChartProps) => {
  // DB Dev Comment: Fetch sum of expenses grouped by crop_id from crops_expenses table.
  // This links to farmer's planner crops table.
  const mockData = [
    { crop: "Maize", cost: 30000, budgetedCost: 28000, area: 50 },
    { crop: "Wheat", cost: 25000, budgetedCost: 27000, area: 35 },
    { crop: "Soybeans", cost: 15000, budgetedCost: 16000, area: 25 },
    { crop: "Sunflower", cost: 12000, budgetedCost: 11000, area: 20 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Cost Per Crop Analysis
          <Badge variant="secondary">Cost per Hectare</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="crop" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value, name) => [
                `R${SecureDataHandler.maskFinancialData(Number(value))}`,
                name === 'cost' ? 'Actual Cost' : 'Budgeted Cost'
              ]}
            />
            <Legend />
            <Bar
              dataKey="budgetedCost"
              fill="#e2e8f0"
              name="Budgeted Cost"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="cost"
              fill="#f87171"
              name="Actual Cost"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CostPerCropChart;